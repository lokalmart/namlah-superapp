import { getOdooBridgeStatus, safeErrorMessage } from './config';
import { createOdooBridgeClient, type OdooBridgeClient } from './client';

type FieldSpec = {
  name: string;
  type?: string;
  relation?: string;
};

type ModelSpec = {
  model: string;
  fields: FieldSpec[];
};

export type OdooFieldAudit = FieldSpec & {
  present: boolean;
  actualType?: string;
  actualRelation?: string;
  status: 'ready' | 'missing' | 'type_mismatch' | 'relation_mismatch';
};

export type OdooModelAudit = {
  model: string;
  ok: boolean;
  readable: boolean;
  fields: OdooFieldAudit[];
  error?: string;
};

export type OdooSchemaAuditResult = {
  ok: boolean;
  generatedAt: string;
  bridge: ReturnType<typeof getOdooBridgeStatus>;
  totals: {
    models: number;
    readyModels: number;
    missingFields: number;
    mismatchedFields: number;
  };
  models: OdooModelAudit[];
};

const commonScopeFields: FieldSpec[] = [
  { name: 'x_namlah_koloni_code', type: 'char' },
  { name: 'x_namlah_wilayah_code', type: 'char' },
  { name: 'x_namlah_source_app', type: 'char' },
  { name: 'x_namlah_template_code', type: 'char' },
  { name: 'x_namlah_plan_code', type: 'char' },
];

const actorFields: FieldSpec[] = [
  { name: 'x_namlah_semut_id', type: 'char' },
  { name: 'x_namlah_role_code', type: 'char' },
  { name: 'x_namlah_actor_partner_id', type: 'many2one', relation: 'res.partner' },
  { name: 'x_namlah_mobile_status' },
  { name: 'x_namlah_proof_status' },
];

const requiredModels: ModelSpec[] = [
  {
    model: 'res.partner',
    fields: [
      { name: 'name', type: 'char' },
      { name: 'ref', type: 'char' },
      { name: 'parent_id', type: 'many2one', relation: 'res.partner' },
      { name: 'type', type: 'selection' },
      { name: 'phone', type: 'char' },
      { name: 'street', type: 'char' },
      { name: 'x_namlah_latitude', type: 'float' },
      { name: 'x_namlah_longitude', type: 'float' },
      { name: 'x_namlah_lokasi_gps', type: 'char' },
      { name: 'x_namlah_partner_kind', type: 'char' },
      { name: 'x_namlah_semut_id', type: 'char' },
      { name: 'x_namlah_role_code', type: 'char' },
      { name: 'x_namlah_koloni_code', type: 'char' },
      { name: 'x_namlah_location_source', type: 'char' },
      { name: 'x_namlah_location_updated_at', type: 'datetime' },
      { name: 'x_namlah_is_koloni', type: 'boolean' },
    ],
  },
  {
    model: 'res.users',
    fields: [
      { name: 'name', type: 'char' },
      { name: 'login', type: 'char' },
      { name: 'partner_id', type: 'many2one', relation: 'res.partner' },
      { name: 'groups_id', type: 'many2many', relation: 'res.groups' },
      { name: 'active', type: 'boolean' },
    ],
  },
  {
    model: 'project.project',
    fields: [
      { name: 'name', type: 'char' },
      ...commonScopeFields,
    ],
  },
  {
    model: 'project.task',
    fields: [
      { name: 'name', type: 'char' },
      { name: 'project_id', type: 'many2one', relation: 'project.project' },
      { name: 'stage_id', type: 'many2one' },
      { name: 'parent_id', type: 'many2one', relation: 'project.task' },
      { name: 'date_deadline' },
      { name: 'priority' },
      ...commonScopeFields,
      ...actorFields,
      { name: 'x_namlah_sale_order_id', type: 'many2one', relation: 'sale.order' },
    ],
  },
  {
    model: 'project.task.type',
    fields: [
      { name: 'name', type: 'char' },
      { name: 'sequence', type: 'integer' },
      { name: 'x_namlah_sop_step_code', type: 'char' },
      { name: 'x_namlah_required_proof' },
      { name: 'x_namlah_mobile_hint' },
    ],
  },
  {
    model: 'project.milestone',
    fields: [
      { name: 'name', type: 'char' },
      { name: 'project_id', type: 'many2one', relation: 'project.project' },
      { name: 'deadline' },
      { name: 'is_reached', type: 'boolean' },
      ...commonScopeFields,
    ],
  },
  {
    model: 'sale.order',
    fields: [
      { name: 'name', type: 'char' },
      { name: 'partner_id', type: 'many2one', relation: 'res.partner' },
      { name: 'partner_shipping_id', type: 'many2one', relation: 'res.partner' },
      { name: 'order_line', type: 'one2many' },
      { name: 'amount_total', type: 'monetary' },
      { name: 'state', type: 'selection' },
      { name: 'date_order' },
      ...commonScopeFields,
      ...actorFields,
      { name: 'x_namlah_project_id', type: 'many2one', relation: 'project.project' },
      { name: 'x_namlah_task_id', type: 'many2one', relation: 'project.task' },
      { name: 'x_namlah_outlet_code', type: 'char' },
    ],
  },
  {
    model: 'product.product',
    fields: [
      { name: 'name', type: 'char' },
      { name: 'default_code', type: 'char' },
      { name: 'sale_ok', type: 'boolean' },
      { name: 'list_price', type: 'float' },
    ],
  },
  {
    model: 'account.move',
    fields: [
      { name: 'name' },
      { name: 'state', type: 'selection' },
      ...commonScopeFields,
    ],
  },
  {
    model: 'account.move.line',
    fields: [
      { name: 'account_id', type: 'many2one' },
      { name: 'debit', type: 'monetary' },
      { name: 'credit', type: 'monetary' },
      { name: 'balance', type: 'monetary' },
      { name: 'date', type: 'date' },
      ...commonScopeFields,
    ],
  },
  {
    model: 'ir.attachment',
    fields: [
      { name: 'name', type: 'char' },
      { name: 'datas', type: 'binary' },
      { name: 'res_model', type: 'char' },
      { name: 'res_id' },
      { name: 'mimetype', type: 'char' },
    ],
  },
];

function auditField(spec: FieldSpec, fields: Awaited<ReturnType<OdooBridgeClient['fieldsGet']>>): OdooFieldAudit {
  const actual = fields[spec.name];
  if (!actual) return { ...spec, present: false, status: 'missing' };
  if (spec.type && actual.type && spec.type !== actual.type) {
    return { ...spec, present: true, actualType: actual.type, actualRelation: actual.relation, status: 'type_mismatch' };
  }
  if (spec.relation && actual.relation && spec.relation !== actual.relation) {
    return { ...spec, present: true, actualType: actual.type, actualRelation: actual.relation, status: 'relation_mismatch' };
  }
  return { ...spec, present: true, actualType: actual.type, actualRelation: actual.relation, status: 'ready' };
}

export async function auditOdooSchema(clientArg?: OdooBridgeClient): Promise<OdooSchemaAuditResult> {
  const bridge = getOdooBridgeStatus();
  const generatedAt = new Date().toISOString();

  if (!bridge.configured) {
    const missingFields = requiredModels.reduce((total, spec) => total + spec.fields.length, 0);
    return {
      ok: false,
      generatedAt,
      bridge,
      totals: { models: requiredModels.length, readyModels: 0, missingFields, mismatchedFields: 0 },
      models: requiredModels.map((spec) => ({
        model: spec.model,
        ok: false,
        readable: false,
        fields: spec.fields.map((field) => ({ ...field, present: false, status: 'missing' })),
        error: `Bridge not configured. Missing: ${bridge.missingConnectionEnv.join(', ') || 'valid ODOO_URL'}.`,
      })),
    };
  }

  const client = clientArg || await createOdooBridgeClient();
  const models: OdooModelAudit[] = [];

  for (const spec of requiredModels) {
    try {
      const fields = await client.fieldsGet(spec.model);
      const fieldAudits = spec.fields.map((field) => auditField(field, fields));
      models.push({
        model: spec.model,
        ok: fieldAudits.every((field) => field.status === 'ready'),
        readable: true,
        fields: fieldAudits,
      });
    } catch (error) {
      models.push({
        model: spec.model,
        ok: false,
        readable: false,
        fields: spec.fields.map((field) => ({ ...field, present: false, status: 'missing' })),
        error: safeErrorMessage(error),
      });
    }
  }

  const missingFields = models.flatMap((model) => model.fields).filter((field) => field.status === 'missing').length;
  const mismatchedFields = models.flatMap((model) => model.fields).filter((field) => field.status === 'type_mismatch' || field.status === 'relation_mismatch').length;

  return {
    ok: models.every((model) => model.ok),
    generatedAt,
    bridge,
    totals: {
      models: requiredModels.length,
      readyModels: models.filter((model) => model.ok).length,
      missingFields,
      mismatchedFields,
    },
    models,
  };
}
