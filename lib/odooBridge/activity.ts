import { createOdooBridgeClient, type OdooBridgeClient, type OdooFieldMap } from './client';

export type NamlahActivityRecord = {
  id: string;
  model: 'project.task' | 'sale.order';
  odooId: number;
  title: string;
  detail: string;
  semutId: string;
  roleCode: string;
  koloniCode: string;
  updatedAt: string;
};

type TaskRow = {
  id: number;
  name?: string;
  project_id?: unknown;
  stage_id?: unknown;
  write_date?: string;
  x_namlah_semut_id?: string | false;
  x_namlah_role_code?: string | false;
  x_namlah_koloni_code?: string | false;
};

type SaleOrderRow = {
  id: number;
  name?: string;
  partner_id?: unknown;
  state?: string;
  date_order?: string | false;
  x_namlah_semut_id?: string | false;
  x_namlah_role_code?: string | false;
  x_namlah_koloni_code?: string | false;
};

function relationName(value: unknown) {
  if (Array.isArray(value)) return String(value[1] ?? value[0] ?? '');
  if (value === false || value === null || value === undefined) return '';
  return String(value);
}

function text(value: unknown, fallback = '') {
  if (value === false || value === null || value === undefined) return fallback;
  return String(value);
}

function existingFieldNames(fields: OdooFieldMap, wanted: string[]) {
  return wanted.filter((field) => Boolean(fields[field]));
}

async function safeFields(client: OdooBridgeClient, model: string) {
  try {
    return await client.fieldsGet(model);
  } catch {
    throw new Error(`${model} belum tersedia di Odoo untuk aktivitas koloni.`);
  }
}

function scopeDomain(fields: OdooFieldMap, koloniCode: string) {
  if (!fields.x_namlah_koloni_code) {
    throw new Error('Field x_namlah_koloni_code wajib ada agar aktivitas tidak membaca record di luar koloni.');
  }
  return [['x_namlah_koloni_code', '=', koloniCode]];
}

function toTask(row: TaskRow): NamlahActivityRecord {
  return {
    id: `task_${row.id}`,
    model: 'project.task',
    odooId: row.id,
    title: text(row.name, `Task ${row.id}`),
    detail: `${relationName(row.project_id) || 'Odoo Project'} / ${relationName(row.stage_id) || 'Stage'}`,
    semutId: text(row.x_namlah_semut_id, 'SMT-ODOO'),
    roleCode: text(row.x_namlah_role_code, 'member'),
    koloniCode: text(row.x_namlah_koloni_code),
    updatedAt: row.write_date || '',
  };
}

function toSaleOrder(row: SaleOrderRow): NamlahActivityRecord {
  return {
    id: `sale_order_${row.id}`,
    model: 'sale.order',
    odooId: row.id,
    title: text(row.name, `Sale Order ${row.id}`),
    detail: `${relationName(row.partner_id) || 'Customer Odoo'} / ${row.state || 'state'}`,
    semutId: text(row.x_namlah_semut_id, 'SMT-ODOO'),
    roleCode: text(row.x_namlah_role_code, 'kasir'),
    koloniCode: text(row.x_namlah_koloni_code),
    updatedAt: text(row.date_order),
  };
}

export async function listKoloniActivities(koloniCode: string): Promise<{ ok: true; source: 'odoo_live'; records: NamlahActivityRecord[] }> {
  if (!koloniCode) throw new Error('koloniCode wajib diisi untuk membaca aktivitas Odoo.');

  const client = await createOdooBridgeClient();
  const taskFieldsMap = await safeFields(client, 'project.task');
  const salesFieldsMap = await safeFields(client, 'sale.order');
  const taskFields = existingFieldNames(taskFieldsMap, ['id', 'name', 'project_id', 'stage_id', 'write_date', 'x_namlah_semut_id', 'x_namlah_role_code', 'x_namlah_koloni_code']);
  const salesFields = existingFieldNames(salesFieldsMap, ['id', 'name', 'partner_id', 'state', 'date_order', 'x_namlah_semut_id', 'x_namlah_role_code', 'x_namlah_koloni_code']);

  const [tasks, salesOrders] = await Promise.all([
    client.searchRead<TaskRow>('project.task', scopeDomain(taskFieldsMap, koloniCode), taskFields, {
      limit: 8,
      order: taskFieldsMap.write_date ? 'write_date desc' : undefined,
    }),
    client.searchRead<SaleOrderRow>('sale.order', scopeDomain(salesFieldsMap, koloniCode), salesFields, {
      limit: 6,
      order: salesFieldsMap.date_order ? 'date_order desc' : undefined,
    }),
  ]);

  const records = [...tasks.map(toTask), ...salesOrders.map(toSaleOrder)]
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .slice(0, 10);

  return {
    ok: true,
    source: 'odoo_live',
    records,
  };
}
