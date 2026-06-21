import type { NamlahControlTask, NamlahOdooEnvelope } from '../types';
import { makePortalIdentity } from '../portalIdentity';
import { areOdooWritesEnabled, isOdooBridgeLive, safeErrorMessage } from './config';
import { createOdooBridgeClient, type OdooBridgeClient, type OdooFieldMap } from './client';

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
  mode: 'not_configured' | 'writes_disabled' | 'executed' | 'error';
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

function numberField(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(String(value || '').replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function findByExternalId(client: OdooBridgeClient, externalId?: string) {
  if (!externalId) return null;
  return client.resolveExternalId(externalId);
}

function isInvalidFieldError(error: unknown) {
  const message = safeErrorMessage(error);
  return /Invalid field '.+' on model '.+'/.test(message);
}

async function findFirst(client: OdooBridgeClient, model: string, domain: unknown[], fields: string[] = ['id']) {
  let rows: Array<{ id: number }>;
  try {
    rows = await client.searchRead<{ id: number }>(model, domain, fields, { limit: 1 });
  } catch (error) {
    if (isInvalidFieldError(error)) return undefined;
    throw error;
  }
  return rows[0]?.id;
}

const fieldCache = new WeakMap<OdooBridgeClient, Map<string, OdooFieldMap>>();

async function getModelFields(client: OdooBridgeClient, model: string) {
  let modelCache = fieldCache.get(client);
  if (!modelCache) {
    modelCache = new Map();
    fieldCache.set(client, modelCache);
  }

  const cached = modelCache.get(model);
  if (cached) return cached;

  const fields = await client.fieldsGet(model);
  modelCache.set(model, fields);
  return fields;
}

async function filterWritableValues(client: OdooBridgeClient, model: string, values: Record<string, unknown>) {
  const fields = await getModelFields(client, model);
  return Object.fromEntries(Object.entries(values).filter(([key, value]) => {
    const field = fields[key];
    return value !== undefined && Boolean(field) && !field.readonly;
  }));
}

async function upsertPartner(client: OdooBridgeClient, envelope: NamlahOdooEnvelope) {
  const semutId = envelope.actorSemutId;
  const portal = makePortalIdentity(semutId);
  const externalId = portal.partnerExternalId;
  const existingExternal = await findByExternalId(client, externalId);
  const existingId = existingExternal?.res_id || await findFirst(client, 'res.partner', [['ref', '=', semutId]]);
  const values = await filterWritableValues(client, 'res.partner', {
    name: envelope.fields.name || semutId,
    ref: semutId,
  });

  if (existingId) {
    await client.write('res.partner', [existingId], values);
    await client.ensureExternalId(externalId, 'res.partner', existingId);
    return { model: 'res.partner', id: existingId, externalId };
  }

  const id = await client.create('res.partner', values);
  await client.ensureExternalId(externalId, 'res.partner', id);
  return { model: 'res.partner', id, externalId };
}

async function getPortalGroupId(client: OdooBridgeClient) {
  const portalGroup = await client.resolveExternalId('base.group_portal');
  if (!portalGroup?.res_id || portalGroup.model !== 'res.groups') {
    throw new Error('Odoo portal group base.group_portal tidak ditemukan.');
  }
  return portalGroup.res_id;
}

async function upsertPortalUser(client: OdooBridgeClient, envelope: NamlahOdooEnvelope, partnerId: number) {
  const portal = makePortalIdentity(envelope.actorSemutId);
  const login = String(envelope.fields.portal_login || envelope.fields.login || portal.portalLogin);
  const externalId = portal.userExternalId;
  const portalGroupId = await getPortalGroupId(client);
  const existingExternal = await findByExternalId(client, externalId);
  const existingId = existingExternal?.res_id || await findFirst(client, 'res.users', [['login', '=', login]]);

  if (existingId) {
    await client.executeKw('res.users', 'write', [[existingId], {
      name: envelope.fields.name || envelope.actorSemutId,
      active: true,
      groups_id: [[4, portalGroupId]],
    }], {
      context: {
        no_reset_password: true,
        mail_create_nosubscribe: true,
        tracking_disable: true,
      },
    });
    await client.ensureExternalId(externalId, 'res.users', existingId);
    return { model: 'res.users', id: existingId, externalId };
  }

  const id = await client.executeKw<number>('res.users', 'create', [{
    name: envelope.fields.name || envelope.actorSemutId,
    login,
    partner_id: partnerId,
    active: true,
    groups_id: [[6, 0, [portalGroupId]]],
  }], {
    context: {
      no_reset_password: true,
      mail_create_nosubscribe: true,
      tracking_disable: true,
    },
  });
  await client.ensureExternalId(externalId, 'res.users', id);
  return { model: 'res.users', id, externalId };
}

async function upsertPortalActor(client: OdooBridgeClient, envelope: NamlahOdooEnvelope) {
  const partner = await upsertPartner(client, envelope);
  const user = await upsertPortalUser(client, envelope, partner.id);
  return [partner, user];
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
  const values = await filterWritableValues(client, 'project.project', { ...envelope.fields });

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
  const values: Record<string, unknown> = { ...envelope.fields };
  delete values.id;
  delete values.stage_id_external_id;

  const stageExternal = envelope.fields.stage_id_external_id ? String(envelope.fields.stage_id_external_id) : undefined;
  const stage = stageExternal ? await client.resolveExternalId(stageExternal) : null;
  if (stage?.model === 'project.task.type') values.stage_id = stage.res_id;

  const cleanValues = await filterWritableValues(client, 'project.task', values);

  if (existingId) {
    await client.write('project.task', [existingId], cleanValues);
    await client.ensureExternalId(externalId, 'project.task', existingId);
    return { model: 'project.task', id: existingId, externalId };
  }

  const id = await client.create('project.task', cleanValues);
  await client.ensureExternalId(externalId, 'project.task', id);
  return { model: 'project.task', id, externalId };
}

async function upsertKoloniPartner(client: OdooBridgeClient, envelope: NamlahOdooEnvelope) {
  const externalId = `namlah_partner.koloni_${cleanExternalSuffix(envelope.koloniCode)}`;
  const existingExternal = await findByExternalId(client, externalId);
  const existingId = existingExternal?.res_id || await findFirst(client, 'res.partner', [['ref', '=', envelope.koloniCode]]);
  const values = {
    name: `Koloni ${envelope.koloniCode}`,
    ref: envelope.koloniCode,
    company_type: 'company',
  };

  if (existingId) {
    await client.write('res.partner', [existingId], await filterWritableValues(client, 'res.partner', values));
    await client.ensureExternalId(externalId, 'res.partner', existingId);
    return { model: 'res.partner', id: existingId, externalId };
  }

  const id = await client.create('res.partner', await filterWritableValues(client, 'res.partner', values));
  await client.ensureExternalId(externalId, 'res.partner', id);
  return { model: 'res.partner', id, externalId };
}

async function upsertDeliveryPartner(client: OdooBridgeClient, envelope: NamlahOdooEnvelope, koloniPartnerId: number) {
  const name = String(envelope.fields.delivery_customer_name || '').trim();
  if (!name) return { model: 'res.partner', id: koloniPartnerId, externalId: `namlah_partner.koloni_${cleanExternalSuffix(envelope.koloniCode)}` };

  const suffix = cleanExternalSuffix(`${envelope.koloniCode}.${envelope.actorSemutId}.${name}`);
  const externalId = `namlah_partner.delivery_${suffix}`;
  const existingExternal = await findByExternalId(client, externalId);
  const existingId = existingExternal?.res_id || await findFirst(client, 'res.partner', [['parent_id', '=', koloniPartnerId], ['name', '=', name]]);
  const values = {
    name,
    parent_id: koloniPartnerId,
    type: 'delivery',
    phone: envelope.fields.delivery_phone || undefined,
    street: envelope.fields.delivery_address || undefined,
  };
  const cleanValues = await filterWritableValues(client, 'res.partner', values);

  if (existingId) {
    await client.write('res.partner', [existingId], cleanValues);
    await client.ensureExternalId(externalId, 'res.partner', existingId);
    return { model: 'res.partner', id: existingId, externalId };
  }

  const id = await client.create('res.partner', cleanValues);
  await client.ensureExternalId(externalId, 'res.partner', id);
  return { model: 'res.partner', id, externalId };
}

async function ensureCashierProduct(client: OdooBridgeClient) {
  const externalId = 'namlah_product.kasir_transaksi';
  const existingExternal = await findByExternalId(client, externalId);
  if (existingExternal?.res_id) return { model: 'product.product', id: existingExternal.res_id, externalId };

  const found = await findFirst(client, 'product.product', [['default_code', '=', 'NAMLAH-KASIR-TRX']]);
  if (found) {
    await client.ensureExternalId(externalId, 'product.product', found);
    return { model: 'product.product', id: found, externalId };
  }

  const values = await filterWritableValues(client, 'product.product', {
    name: 'Namlah Transaksi Kasir',
    default_code: 'NAMLAH-KASIR-TRX',
    type: 'service',
    detailed_type: 'service',
    sale_ok: true,
    purchase_ok: false,
    list_price: 0,
  });
  const id = await client.create('product.product', values);
  await client.ensureExternalId(externalId, 'product.product', id);
  return { model: 'product.product', id, externalId };
}

async function upsertCashierProjectAndTask(client: OdooBridgeClient, envelope: NamlahOdooEnvelope) {
  const projectExternalId = `namlah_project.cashier_${cleanExternalSuffix(envelope.koloniCode)}`;
  const projectCode = `cashier_transaction_flow.${envelope.koloniCode}`;
  const existingProject = await findByExternalId(client, projectExternalId);
  const projectId = existingProject?.res_id || await findFirst(client, 'project.project', [['x_namlah_plan_code', '=', projectCode]]);
  const projectValues = await filterWritableValues(client, 'project.project', {
    name: `Kasir ${envelope.koloniCode}`,
    x_namlah_koloni_code: envelope.koloniCode,
    x_namlah_wilayah_code: envelope.wilayahCode,
    x_namlah_source_app: 'namlah-kasir',
    x_namlah_template_code: 'cashier_transaction_flow',
    x_namlah_plan_code: projectCode,
  });
  const finalProjectId = projectId || await client.create('project.project', projectValues);
  if (projectId) await client.write('project.project', [projectId], projectValues);
  await client.ensureExternalId(projectExternalId, 'project.project', finalProjectId);

  const taskExternalId = `namlah_task.cashier_${cleanExternalSuffix(`${envelope.koloniCode}.${envelope.actorSemutId}`)}`;
  const taskCode = `cashier_task.${envelope.koloniCode}.${envelope.actorSemutId}`;
  const existingTask = await findByExternalId(client, taskExternalId);
  const taskId = existingTask?.res_id || await findFirst(client, 'project.task', [['x_namlah_plan_code', '=', taskCode]]);
  const taskValues = await filterWritableValues(client, 'project.task', {
    name: `Kasir ${envelope.actorSemutId}`,
    project_id: finalProjectId,
    x_namlah_semut_id: envelope.actorSemutId,
    x_namlah_role_code: 'kasir',
    x_namlah_koloni_code: envelope.koloniCode,
    x_namlah_wilayah_code: envelope.wilayahCode,
    x_namlah_source_app: 'namlah-kasir',
    x_namlah_template_code: 'cashier_transaction_flow',
    x_namlah_plan_code: taskCode,
    x_namlah_mobile_status: 'synced',
    x_namlah_proof_status: 'submitted',
  });
  const finalTaskId = taskId || await client.create('project.task', taskValues);
  if (taskId) await client.write('project.task', [taskId], taskValues);
  await client.ensureExternalId(taskExternalId, 'project.task', finalTaskId);

  return {
    project: { model: 'project.project', id: finalProjectId, externalId: projectExternalId },
    task: { model: 'project.task', id: finalTaskId, externalId: taskExternalId },
  };
}

async function createCashierSaleOrder(client: OdooBridgeClient, envelope: NamlahOdooEnvelope) {
  const transactionCode = String(envelope.fields.x_namlah_plan_code || `cashier.${envelope.koloniCode}.${envelope.actorSemutId}.${Date.now()}`);
  const externalId = `namlah_sale_order.${cleanExternalSuffix(transactionCode)}`;
  const existingOrder = await findByExternalId(client, externalId);
  if (existingOrder?.res_id) return [{ model: 'sale.order', id: existingOrder.res_id, externalId }];

  const koloniPartner = await upsertKoloniPartner(client, envelope);
  const deliveryPartner = await upsertDeliveryPartner(client, envelope, koloniPartner.id);
  const product = await ensureCashierProduct(client);
  const cashier = await upsertCashierProjectAndTask(client, envelope);
  const amount = numberField(envelope.fields.amount_total_input);
  if (amount <= 0) throw new Error('Nilai transaksi kasir harus lebih besar dari 0.');

  const saleValues = await filterWritableValues(client, 'sale.order', {
    partner_id: koloniPartner.id,
    partner_shipping_id: deliveryPartner.id,
    origin: cashier.task.externalId,
    client_order_ref: transactionCode,
    x_namlah_semut_id: envelope.actorSemutId,
    x_namlah_role_code: 'kasir',
    x_namlah_koloni_code: envelope.koloniCode,
    x_namlah_wilayah_code: envelope.wilayahCode,
    x_namlah_source_app: 'namlah-kasir',
    x_namlah_template_code: 'cashier_transaction_flow',
    x_namlah_plan_code: transactionCode,
    x_namlah_project_id: cashier.project.id,
    x_namlah_task_id: cashier.task.id,
    note: envelope.fields.note || undefined,
  });
  saleValues.order_line = [[0, 0, {
    product_id: product.id,
    name: envelope.fields.note || `Transaksi kasir ${envelope.actorSemutId}`,
    product_uom_qty: 1,
    price_unit: amount,
  }]];

  const orderId = await client.create('sale.order', saleValues);
  await client.ensureExternalId(externalId, 'sale.order', orderId);

  const taskUpdate = await filterWritableValues(client, 'project.task', {
    x_namlah_sale_order_id: orderId,
  });
  if (Object.keys(taskUpdate).length) await client.write('project.task', [cashier.task.id], taskUpdate);
  await client.executeKw('project.task', 'message_post', [[cashier.task.id]], {
    body: `Transaksi kasir dibuat: sale.order ${externalId}, nilai ${amount}, kirim ke ${envelope.fields.delivery_customer_name || 'kontak koloni'}.`,
    subtype_xmlid: 'mail.mt_note',
  });

  return [
    koloniPartner,
    deliveryPartner,
    product,
    cashier.project,
    cashier.task,
    { model: 'sale.order', id: orderId, externalId },
  ];
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
    const cleanValues = await filterWritableValues(client, 'project.task', values);

    const existingId = existingExternal?.res_id || await findFirst(client, 'project.task', [['x_namlah_plan_code', '=', task.planCode], ['name', '=', task.title]]);
    if (existingId) {
      await client.write('project.task', [existingId], cleanValues);
      await client.ensureExternalId(externalId, 'project.task', existingId);
      taskIdMap.set(task.id, existingId);
      records.push({ model: 'project.task', id: existingId, externalId });
      continue;
    }

    const id = await client.create('project.task', cleanValues);
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
  const cleanValues = await filterWritableValues(client, 'project.task', values);
  if (Object.keys(cleanValues).length) await client.write('project.task', [taskId], cleanValues);
  return [{ model: 'project.task', id: taskId, externalId }];
}

async function submitTaskProof(client: OdooBridgeClient, payload: GatewayPayload) {
  const taskIdValue = payload.proof?.taskId || payload.odoo?.fields.project_task_external_id;
  if (!taskIdValue) return [];
  const externalId = String(taskIdValue).startsWith('namlah_task.') ? String(taskIdValue) : `namlah_task.${cleanExternalSuffix(String(taskIdValue))}`;
  const existing = await findByExternalId(client, externalId);
  if (!existing?.res_id) throw new Error(`Task Odoo tidak ditemukan untuk proof ${externalId}.`);

  const proofStatus = payload.proof?.status || payload.odoo?.fields.x_namlah_proof_status || 'submitted';
  const values = await filterWritableValues(client, 'project.task', { x_namlah_proof_status: proofStatus });
  if (Object.keys(values).length) await client.write('project.task', [existing.res_id], values);
  await client.executeKw('project.task', 'message_post', [[existing.res_id]], {
    body: payload.proof?.note || payload.odoo?.fields.note || 'Proof submitted from Namlah Superapp.',
    subtype_xmlid: 'mail.mt_note',
  });
  return [{ model: 'project.task', id: existing.res_id, externalId }];
}

async function executePayload(client: OdooBridgeClient, payload: GatewayPayload) {
  const envelope = payload.odoo;
  if (!envelope) return [];

  if (envelope.targetModel === 'res.partner') return upsertPortalActor(client, envelope);
  if (envelope.targetModel === 'sale.order') return createCashierSaleOrder(client, envelope);
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
      status: 503,
      payload: {
        ...payload,
        ok: false,
        bridge: {
          ok: false,
          live: false,
          writesEnabled: false,
          mode: 'not_configured',
          message: 'Odoo bridge belum aktif. Set NAMLAH_BRIDGE_LIVE=true dan konfigurasi Odoo sebelum aksi ini bisa menulis data real.',
        },
      },
    };
  }

  if (!areOdooWritesEnabled()) {
    return {
      status: 423,
      payload: {
        ...payload,
        ok: false,
        bridge: {
          ok: false,
          live: true,
          writesEnabled: false,
          mode: 'writes_disabled',
          message: 'Odoo live sudah aktif, tetapi write masih terkunci. Set NAMLAH_BRIDGE_WRITES=true setelah schema-audit hijau.',
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
