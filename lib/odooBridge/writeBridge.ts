import type { NamlahControlTask, NamlahOdooEnvelope } from '../types';
import { areOdooWritesEnabled, isOdooBridgeLive, safeErrorMessage } from './config';
import { createOdooBridgeClient, type OdooBridgeClient } from './client';

type GatewayPayload = {
  ok?: boolean;
  odoo?: NamlahOdooEnvelope;
  tasks?: NamlahControlTask[];
  task?: NamlahControlTask;
  proof?: {
    taskId?: string;
    status?: string;
    note?: string;
  };
};

type BridgeSyncResult = {
  ok: boolean;
  live: boolean;
  writesEnabled: boolean;
  mode: 'demo' | 'preview' | 'executed' | 'error';
  message: string;
  records?: Array<{ model: string; id: number; externalId?: string }>;
};

export type PayloadWithBridge<T> = T & {
  bridge: BridgeSyncResult;
};

type BridgeResponse<T> = {
  status: number;
  payload: PayloadWithBridge<T>;
};

function cleanExternalSuffix(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_.]+/g, '_').replace(/^_+|_+$/g, '');
}

function planCode(payload: GatewayPayload) {
  return payload.odoo?.fields.x_namlah_plan_code ? String(payload.odoo.fields.x_namlah_plan_code) : undefined;
}

function taskExternalId(task: NamlahControlTask) {
  return `namlah_task.${cleanExternalSuffix(task.id)}`;
}

async function findByExternalId(client: OdooBridgeClient, externalId?: string) {
  if (!externalId) return null;
  return client.resolveExternalId(externalId);
}

async function findFirst(client: OdooBridgeClient, model: string, domain: unknown[], fields: string[] = ['id']) {
  const rows = await client.searchRead<{ id: number }>(model, domain, fields, { limit: 1 });
  return rows[0]?.id;
}

async function upsertPartner(client: OdooBridgeClient, envelope: NamlahOdooEnvelope) {
  const semutId = envelope.actorSemutId;
  const externalId = `namlah_partner.${cleanExternalSuffix(semutId)}`;
  const existingExternal = await findByExternalId(client, externalId);
  const existingId = existingExternal?.res_id || await findFirst(client, 'res.partner', [['ref', '=', semutId]]);
  const values = {
    name: envelope.fields.name || semutId,
    ref: semutId,
  };

  if (existingId) {
    await client.write('res.partner', [existingId], values);
    await client.ensureExternalId(externalId, 'res.partner', existingId);
    return { model: 'res.partner', id: existingId, externalId };
  }

  const id = await client.create('res.partner', values);
  await client.ensureExternalId(externalId, 'res.partner', id);
  return { model: 'res.partner', id, externalId };
}

async function resolveStageId(client: OdooBridgeClient, stageCode?: string) {
  if (!stageCode) return undefined;
  const external = await client.resolveExternalId(`namlah_control.stage_${cleanExternalSuffix(stageCode)}`);
  if (external?.model === 'project.task.type') return external.res_id;
  const found = await findFirst(client, 'project.task.type', [['x_namlah_sop_step_code', '=', stageCode]]);
  return found;
}

async function upsertProject(client: OdooBridgeClient, envelope: NamlahOdooEnvelope) {
  const code = planCode({ odoo: envelope }) || `project.${envelope.actorSemutId}.${Date.now()}`;
  const externalId = `namlah_project.${cleanExternalSuffix(code)}`;
  const existingExternal = await findByExternalId(client, externalId);
  const existingId = existingExternal?.res_id || await findFirst(client, 'project.project', [['x_namlah_plan_code', '=', code]]);
  const values = { ...envelope.fields };

  if (existingId) {
    await client.write('project.project', [existingId], values);
    await client.ensureExternalId(externalId, 'project.project', existingId);
    return { model: 'project.project', id: existingId, externalId };
  }

  const id = await client.create('project.project', values);
  await client.ensureExternalId(externalId, 'project.project', id);
  return { model: 'project.project', id, externalId };
}

async function upsertTaskFromEnvelope(client: OdooBridgeClient, envelope: NamlahOdooEnvelope) {
  const code = planCode({ odoo: envelope }) || `task.${envelope.actorSemutId}.${envelope.fields.name || Date.now()}`;
  const externalId = `namlah_task.${cleanExternalSuffix(code)}`;
  const existingExternal = await findByExternalId(client, externalId);
  const existingId = existingExternal?.res_id || await findFirst(client, 'project.task', [['x_namlah_plan_code', '=', code], ['name', '=', envelope.fields.name || '']]);
  const values = { ...envelope.fields };
  delete values.id;
  delete values.stage_id_external_id;

  const stageExternal = envelope.fields.stage_id_external_id ? String(envelope.fields.stage_id_external_id) : undefined;
  const stage = stageExternal ? await client.resolveExternalId(stageExternal) : null;
  if (stage?.model === 'project.task.type') values.stage_id = stage.res_id;

  if (existingId) {
    await client.write('project.task', [existingId], values);
    await client.ensureExternalId(externalId, 'project.task', existingId);
    return { model: 'project.task', id: existingId, externalId };
  }

  const id = await client.create('project.task', values);
  await client.ensureExternalId(externalId, 'project.task', id);
  return { model: 'project.task', id, externalId };
}

async function upsertTaskBlueprints(client: OdooBridgeClient, tasks: NamlahControlTask[], projectId?: number) {
  const records: Array<{ model: string; id: number; externalId?: string }> = [];
  const taskIdMap = new Map<string, number>();

  const ordered = [...tasks].sort((a, b) => (a.parentId ? 1 : 0) - (b.parentId ? 1 : 0));
  for (const task of ordered) {
    const externalId = taskExternalId(task);
    const existingExternal = await findByExternalId(client, externalId);
    const stageId = await resolveStageId(client, task.stageCode);
    const values: Record<string, unknown> = {
      name: task.title,
      project_id: projectId,
      parent_id: task.parentId ? taskIdMap.get(task.parentId) : undefined,
      stage_id: stageId,
      date_deadline: task.deadline || undefined,
      priority: task.priority,
      x_namlah_semut_id: task.semutId,
      x_namlah_role_code: task.roleCode,
      x_namlah_koloni_code: task.koloniCode,
      x_namlah_wilayah_code: task.wilayahCode,
      x_namlah_source_app: task.sourceApp,
      x_namlah_template_code: task.templateCode,
      x_namlah_plan_code: task.planCode,
      x_namlah_mobile_status: task.mobileStatus,
      x_namlah_proof_status: task.proofStatus,
    };
    Object.keys(values).forEach((key) => values[key] === undefined && delete values[key]);

    const existingId = existingExternal?.res_id || await findFirst(client, 'project.task', [['x_namlah_plan_code', '=', task.planCode], ['name', '=', task.title]]);
    if (existingId) {
      await client.write('project.task', [existingId], values);
      await client.ensureExternalId(externalId, 'project.task', existingId);
      taskIdMap.set(task.id, existingId);
      records.push({ model: 'project.task', id: existingId, externalId });
      continue;
    }

    const id = await client.create('project.task', values);
    await client.ensureExternalId(externalId, 'project.task', id);
    taskIdMap.set(task.id, id);
    records.push({ model: 'project.task', id, externalId });
  }

  return records;
}

async function updateTaskStatus(client: OdooBridgeClient, payload: GatewayPayload) {
  if (!payload.task) return [];
  const externalId = taskExternalId(payload.task);
  const existing = await findByExternalId(client, externalId);
  const taskId = existing?.res_id || await findFirst(client, 'project.task', [['x_namlah_plan_code', '=', payload.task.planCode], ['name', '=', payload.task.title]]);
  if (!taskId) throw new Error(`Task Odoo tidak ditemukan untuk ${payload.task.id}.`);

  const stageId = await resolveStageId(client, payload.task.stageCode);
  const values: Record<string, unknown> = {
    stage_id: stageId,
    x_namlah_mobile_status: payload.task.mobileStatus,
    x_namlah_proof_status: payload.task.proofStatus,
    x_namlah_semut_id: payload.task.semutId,
    x_namlah_role_code: payload.task.roleCode,
  };
  Object.keys(values).forEach((key) => values[key] === undefined && delete values[key]);
  await client.write('project.task', [taskId], values);
  return [{ model: 'project.task', id: taskId, externalId }];
}

async function submitTaskProof(client: OdooBridgeClient, payload: GatewayPayload) {
  const taskIdValue = payload.proof?.taskId || payload.odoo?.fields.project_task_external_id;
  if (!taskIdValue) return [];
  const externalId = String(taskIdValue).startsWith('namlah_task.') ? String(taskIdValue) : `namlah_task.${cleanExternalSuffix(String(taskIdValue))}`;
  const existing = await findByExternalId(client, externalId);
  if (!existing?.res_id) throw new Error(`Task Odoo tidak ditemukan untuk proof ${externalId}.`);

  const proofStatus = payload.proof?.status || payload.odoo?.fields.x_namlah_proof_status || 'submitted';
  await client.write('project.task', [existing.res_id], { x_namlah_proof_status: proofStatus });
  await client.executeKw('project.task', 'message_post', [[existing.res_id]], {
    body: payload.proof?.note || payload.odoo?.fields.note || 'Proof submitted from Namlah Superapp.',
    subtype_xmlid: 'mail.mt_note',
  });
  return [{ model: 'project.task', id: existing.res_id, externalId }];
}

async function executePayload(client: OdooBridgeClient, payload: GatewayPayload) {
  const envelope = payload.odoo;
  if (!envelope) return [];

  if (envelope.targetModel === 'res.partner') return [await upsertPartner(client, envelope)];
  if (envelope.targetModel === 'project.project') {
    const project = await upsertProject(client, envelope);
    const taskRecords = payload.tasks?.length ? await upsertTaskBlueprints(client, payload.tasks, project.id) : [];
    return [project, ...taskRecords];
  }
  if (envelope.targetModel === 'project.task.proof') return submitTaskProof(client, payload);
  if (payload.task) return updateTaskStatus(client, payload);
  if (payload.tasks?.length) return upsertTaskBlueprints(client, payload.tasks);
  if (envelope.targetModel === 'project.task') return [await upsertTaskFromEnvelope(client, envelope)];
  return [];
}

export async function attachOdooBridgeResult<T extends GatewayPayload>(payload: T): Promise<BridgeResponse<T>> {
  if (!isOdooBridgeLive()) {
    return {
      status: 200,
      payload: {
        ...payload,
        bridge: {
          ok: true,
          live: false,
          writesEnabled: false,
          mode: 'demo',
          message: 'Odoo bridge live mode off. Returning demo gateway contract.',
        },
      },
    };
  }

  if (!areOdooWritesEnabled()) {
    return {
      status: 200,
      payload: {
        ...payload,
        bridge: {
          ok: true,
          live: true,
          writesEnabled: false,
          mode: 'preview',
          message: 'Live Odoo is enabled, but writes are locked. Set NAMLAH_BRIDGE_WRITES=true after schema-audit is green.',
        },
      },
    };
  }

  try {
    const client = await createOdooBridgeClient();
    const records = await executePayload(client, payload);
    return {
      status: 200,
      payload: {
        ...payload,
        bridge: {
          ok: true,
          live: true,
          writesEnabled: true,
          mode: 'executed',
          message: `Synced ${records.length} record(s) to Odoo.`,
          records,
        },
      },
    };
  } catch (error) {
    return {
      status: 502,
      payload: {
        ...payload,
        ok: false,
        bridge: {
          ok: false,
          live: true,
          writesEnabled: true,
          mode: 'error',
          message: safeErrorMessage(error),
        },
      },
    };
  }
}
