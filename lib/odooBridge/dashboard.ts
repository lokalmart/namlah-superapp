import { getKoloniScope } from '../koloni';
import { roleConfigs } from '../mockData';
import { controlStages, planTemplates } from '../projectControlTower';
import type {
  NamlahAuditEvent,
  NamlahBalanceSheetLine,
  NamlahControlTask,
  NamlahDashboardMetric,
  NamlahKoloniDashboard,
  NamlahMilestoneRow,
  NamlahMobileStatus,
  NamlahProjectTemplateCode,
  NamlahRatuView,
  NamlahSalesOrder,
  NamlahTaskProofStatus,
  NamlahTemplateCounter,
  RoleId,
} from '../types';
import { createOdooBridgeClient, type OdooBridgeClient, type OdooDomain } from './client';

const roleIds: RoleId[] = ['member', 'surveyor', 'kurir', 'kasir', 'umkm', 'admin', 'koperasi'];
const templateCodes: NamlahProjectTemplateCode[] = [
  'umkm_onboarding_basic',
  'umkm_promotion_sprint',
  'survey_lokasi',
  'setup_kasir',
  'kurir_delivery',
  'donation_execution_plan',
];
const proofStatuses: NamlahTaskProofStatus[] = ['none', 'required', 'submitted', 'approved', 'rejected'];
const mobileStatuses: NamlahMobileStatus[] = ['draft', 'submitted', 'synced', 'blocked'];

type OdooTaskRow = {
  id: number;
  name?: string;
  project_id?: unknown;
  stage_id?: unknown;
  parent_id?: unknown;
  child_ids?: unknown;
  date_deadline?: string | false;
  priority?: string | false;
  create_date?: string;
  write_date?: string;
  x_namlah_semut_id?: string | false;
  x_namlah_role_code?: string | false;
  x_namlah_koloni_code?: string | false;
  x_namlah_wilayah_code?: string | false;
  x_namlah_source_app?: string | false;
  x_namlah_template_code?: string | false;
  x_namlah_plan_code?: string | false;
  x_namlah_mobile_status?: string | false;
  x_namlah_proof_status?: string | false;
};

type OdooSalesOrderRow = {
  id: number;
  name?: string;
  partner_id?: unknown;
  amount_total?: number;
  state?: string;
  date_order?: string | false;
  x_namlah_source_app?: string | false;
  x_namlah_task_id?: unknown;
  x_namlah_koloni_code?: string | false;
};

type OdooMilestoneRow = {
  id: number;
  name?: string;
  project_id?: unknown;
  deadline?: string | false;
  is_reached?: boolean;
  x_namlah_koloni_code?: string | false;
};

type OdooMoveLineRow = {
  id: number;
  account_id?: unknown;
  debit?: number;
  credit?: number;
  balance?: number;
  date?: string | false;
  x_namlah_koloni_code?: string | false;
};

function relationName(value: unknown) {
  if (Array.isArray(value)) return String(value[1] ?? value[0] ?? '');
  if (value === false || value === null || value === undefined) return '';
  return String(value);
}

function relationId(value: unknown) {
  if (Array.isArray(value) && typeof value[0] === 'number') return value[0];
  if (typeof value === 'number') return value;
  return undefined;
}

function text(value: unknown, fallback = '') {
  if (value === false || value === null || value === undefined) return fallback;
  return String(value);
}

function asRoleId(value: unknown): RoleId {
  const candidate = text(value);
  return roleIds.includes(candidate as RoleId) ? candidate as RoleId : 'member';
}

function asTemplateCode(value: unknown): NamlahProjectTemplateCode {
  const candidate = text(value);
  return templateCodes.includes(candidate as NamlahProjectTemplateCode) ? candidate as NamlahProjectTemplateCode : 'umkm_onboarding_basic';
}

function asProofStatus(value: unknown): NamlahTaskProofStatus {
  const candidate = text(value);
  return proofStatuses.includes(candidate as NamlahTaskProofStatus) ? candidate as NamlahTaskProofStatus : 'none';
}

function asMobileStatus(value: unknown): NamlahMobileStatus {
  const candidate = text(value);
  return mobileStatuses.includes(candidate as NamlahMobileStatus) ? candidate as NamlahMobileStatus : 'synced';
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function stageFrom(value: unknown) {
  const label = relationName(value) || 'Tanpa Stage';
  const normalized = normalize(label);
  const matched = controlStages.find((stage) => normalize(stage.label) === normalized || normalize(stage.code) === normalized);
  return {
    code: matched?.code || normalized || 'tanpa_stage',
    label: matched?.label || label,
  };
}

function isLate(deadline?: string | false) {
  if (!deadline) return false;
  const date = new Date(`${deadline}T23:59:59`);
  return Number.isFinite(date.getTime()) && date.getTime() < Date.now();
}

function formatDate(value?: string | false) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function formatPeriod(value?: string | false) {
  const date = formatDate(value);
  return date ? date.slice(0, 7) : new Date().toISOString().slice(0, 7);
}

function formatMoney(value: number | undefined) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function koloniDomain(scopeKoloniCodes: string[]): OdooDomain {
  if (scopeKoloniCodes.length <= 1) return [['x_namlah_koloni_code', '=', scopeKoloniCodes[0]]];
  return [['x_namlah_koloni_code', 'in', scopeKoloniCodes]];
}

async function existingFields(client: OdooBridgeClient, model: string, fields: string[]) {
  const map = await client.fieldsGet(model);
  return fields.filter((field) => Boolean(map[field]));
}

async function assertScopeField(client: OdooBridgeClient, model: string) {
  const map = await client.fieldsGet(model);
  if (!map.x_namlah_koloni_code) {
    throw new Error(`${model} belum punya field x_namlah_koloni_code. Jalankan schema-audit dan seed field Odoo dulu.`);
  }
  return map;
}

function toTask(row: OdooTaskRow): NamlahControlTask {
  const stage = stageFrom(row.stage_id);
  const proofStatus = asProofStatus(row.x_namlah_proof_status);
  const roleCode = asRoleId(row.x_namlah_role_code);
  const childrenCount = Array.isArray(row.child_ids) ? row.child_ids.length : 0;
  return {
    id: `odoo_task_${row.id}`,
    title: text(row.name, `Task ${row.id}`),
    project: relationName(row.project_id) || 'Odoo Project',
    parentId: relationId(row.parent_id) ? `odoo_task_${relationId(row.parent_id)}` : undefined,
    stageCode: stage.code,
    stageLabel: stage.label,
    roleCode,
    semutId: text(row.x_namlah_semut_id, 'SMT-ODOO'),
    koloniCode: text(row.x_namlah_koloni_code),
    wilayahCode: text(row.x_namlah_wilayah_code),
    sourceApp: text(row.x_namlah_source_app, 'odoo'),
    templateCode: asTemplateCode(row.x_namlah_template_code),
    planCode: text(row.x_namlah_plan_code, `odoo.task.${row.id}`),
    proofStatus,
    mobileStatus: asMobileStatus(row.x_namlah_mobile_status),
    deadline: formatDate(row.date_deadline),
    priority: row.priority === '1' ? '1' : '0',
    childrenCount,
    needsValidation: proofStatus === 'submitted' || normalize(stage.label).includes('validasi') || normalize(stage.label).includes('laporan'),
    isLate: isLate(row.date_deadline) && proofStatus !== 'approved',
  };
}

function statusLabel(state?: string) {
  const labels: Record<string, string> = {
    draft: 'Quotation',
    sent: 'Quotation Sent',
    sale: 'Sale Order',
    done: 'Locked',
    cancel: 'Cancelled',
  };
  return labels[state || ''] || state || 'Unknown';
}

function toSalesOrder(row: OdooSalesOrderRow): NamlahSalesOrder {
  return {
    id: `odoo_so_${row.id}`,
    orderNumber: text(row.name, `SO-${row.id}`),
    customer: relationName(row.partner_id) || 'Customer Odoo',
    sourceApp: text(row.x_namlah_source_app, 'odoo-sales'),
    amount: formatMoney(row.amount_total),
    status: statusLabel(row.state),
    linkedTask: relationName(row.x_namlah_task_id) || '-',
    date: formatDate(row.date_order),
    koloniCode: text(row.x_namlah_koloni_code),
  };
}

function toMilestone(row: OdooMilestoneRow, taskCountByProject: Map<number, { total: number; done: number }>): NamlahMilestoneRow {
  const projectId = relationId(row.project_id);
  const progressSource = projectId ? taskCountByProject.get(projectId) : undefined;
  const progress = row.is_reached ? 100 : progressSource?.total ? Math.round((progressSource.done / progressSource.total) * 100) : 0;
  return {
    id: `odoo_ms_${row.id}`,
    milestone: text(row.name, `Milestone ${row.id}`),
    project: relationName(row.project_id) || 'Odoo Project',
    deadline: formatDate(row.deadline),
    reached: Boolean(row.is_reached),
    progress: `${progress}%`,
    koloniCode: text(row.x_namlah_koloni_code),
  };
}

function buildBalanceSheet(lines: OdooMoveLineRow[]): NamlahBalanceSheetLine[] {
  const grouped = new Map<string, { accountGroup: string; debit: number; credit: number; balance: number; period: string; koloniCode: string }>();

  for (const line of lines) {
    const accountGroup = relationName(line.account_id) || 'Unclassified Account';
    const period = formatPeriod(line.date);
    const koloniCode = text(line.x_namlah_koloni_code);
    const key = `${koloniCode}|${period}|${accountGroup}`;
    const current = grouped.get(key) || { accountGroup, debit: 0, credit: 0, balance: 0, period, koloniCode };
    current.debit += line.debit || 0;
    current.credit += line.credit || 0;
    current.balance += line.balance || 0;
    grouped.set(key, current);
  }

  return Array.from(grouped.values()).map((line, index) => ({
    id: `odoo_bs_${index + 1}`,
    accountGroup: line.accountGroup,
    debit: formatMoney(line.debit),
    credit: formatMoney(line.credit),
    balance: formatMoney(line.balance),
    period: line.period,
    koloniCode: line.koloniCode,
  }));
}

function countByStage(tasks: NamlahControlTask[]) {
  const map = new Map<string, { stageCode: string; label: string; count: number }>();
  for (const task of tasks) {
    const current = map.get(task.stageCode) || { stageCode: task.stageCode, label: task.stageLabel, count: 0 };
    current.count += 1;
    map.set(task.stageCode, current);
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function countByRole(tasks: NamlahControlTask[]) {
  return Object.values(roleConfigs)
    .map((role) => ({ roleCode: role.id, label: role.label, count: tasks.filter((task) => task.roleCode === role.id).length }))
    .filter((item) => item.count > 0);
}

function templateCounters(tasks: NamlahControlTask[]): NamlahTemplateCounter[] {
  return planTemplates
    .map((template) => ({ code: template.code, title: template.title, activeCount: tasks.filter((task) => task.templateCode === template.code).length }))
    .filter((item) => item.activeCount > 0)
    .sort((a, b) => b.activeCount - a.activeCount);
}

function buildMetrics(tasks: NamlahControlTask[], salesOrders: NamlahSalesOrder[], milestones: NamlahMilestoneRow[], balanceSheetLines: NamlahBalanceSheetLine[]): NamlahDashboardMetric[] {
  return [
    { label: 'Task aktif', value: String(tasks.length), detail: 'Odoo live project.task' },
    { label: 'Sales order', value: String(salesOrders.length), detail: 'Odoo live sale.order' },
    { label: 'Milestone', value: String(milestones.length), detail: 'Odoo live project.milestone' },
    { label: 'Balance line', value: String(balanceSheetLines.length), detail: 'Odoo live account.move.line' },
  ];
}

function taskProgressByProject(tasks: NamlahControlTask[], rawRows: OdooTaskRow[]) {
  const map = new Map<number, { total: number; done: number }>();
  for (let index = 0; index < tasks.length; index += 1) {
    const projectId = relationId(rawRows[index]?.project_id);
    if (!projectId) continue;
    const current = map.get(projectId) || { total: 0, done: 0 };
    current.total += 1;
    if (tasks[index].proofStatus === 'approved' || normalize(tasks[index].stageLabel).includes('selesai')) current.done += 1;
    map.set(projectId, current);
  }
  return map;
}

function auditTrailFromTasks(tasks: NamlahControlTask[]): NamlahAuditEvent[] {
  return tasks.slice(0, 8).map((task, index) => ({
    id: `odoo_audit_${index + 1}`,
    actorSemutId: task.semutId,
    roleCode: task.roleCode,
    actionType: `odoo.live.${task.mobileStatus}`,
    targetModel: 'project.task',
    targetExternalId: task.planCode,
    sourceApp: task.sourceApp,
    summary: `${task.title} dibaca dari Odoo oleh service account bridge.`,
    timestamp: new Date().toISOString(),
  }));
}

export async function buildLiveKoloniDashboard(roleId: RoleId, koloniCode: string | undefined, activeView: NamlahRatuView): Promise<NamlahKoloniDashboard> {
  if (roleId !== 'admin') {
    throw new Error('Ratu Semut role required.');
  }

  const scope = getKoloniScope(koloniCode);
  const client = await createOdooBridgeClient();
  const domain = koloniDomain(scope.scopeKoloniCodes);

  await assertScopeField(client, 'project.task');
  await assertScopeField(client, 'sale.order');
  await assertScopeField(client, 'project.milestone');
  await assertScopeField(client, 'account.move.line');

  const taskFields = await existingFields(client, 'project.task', ['id', 'name', 'project_id', 'stage_id', 'parent_id', 'child_ids', 'date_deadline', 'priority', 'create_date', 'write_date', 'x_namlah_semut_id', 'x_namlah_role_code', 'x_namlah_koloni_code', 'x_namlah_wilayah_code', 'x_namlah_source_app', 'x_namlah_template_code', 'x_namlah_plan_code', 'x_namlah_mobile_status', 'x_namlah_proof_status']);
  const salesFields = await existingFields(client, 'sale.order', ['id', 'name', 'partner_id', 'amount_total', 'state', 'date_order', 'x_namlah_source_app', 'x_namlah_task_id', 'x_namlah_koloni_code']);
  const milestoneFields = await existingFields(client, 'project.milestone', ['id', 'name', 'project_id', 'deadline', 'is_reached', 'x_namlah_koloni_code']);
  const moveLineFields = await existingFields(client, 'account.move.line', ['id', 'account_id', 'debit', 'credit', 'balance', 'date', 'parent_state', 'x_namlah_koloni_code']);

  const moveLineDomain: OdooDomain = moveLineFields.includes('parent_state') ? [...domain, ['parent_state', '=', 'posted']] : domain;
  const taskRows = await client.searchRead<OdooTaskRow>('project.task', domain, taskFields, { limit: 500, order: 'write_date desc' });
  const salesRows = await client.searchRead<OdooSalesOrderRow>('sale.order', domain, salesFields, { limit: 200, order: 'date_order desc' });
  const milestoneRows = await client.searchRead<OdooMilestoneRow>('project.milestone', domain, milestoneFields, { limit: 200, order: 'deadline asc' });
  const moveLineRows = await client.searchRead<OdooMoveLineRow>('account.move.line', moveLineDomain, moveLineFields.filter((field) => field !== 'parent_state'), { limit: 2000, order: 'date desc' });

  const tasks = taskRows.map(toTask);
  const salesOrders = salesRows.map(toSalesOrder);
  const progressByProject = taskProgressByProject(tasks, taskRows);
  const milestones = milestoneRows.map((row) => toMilestone(row, progressByProject));
  const balanceSheetLines = buildBalanceSheet(moveLineRows);

  return {
    koloniCode: scope.node.code,
    wilayahCode: scope.node.wilayahCode,
    generatedAt: new Date().toISOString(),
    activeView,
    metrics: buildMetrics(tasks, salesOrders, milestones, balanceSheetLines),
    stages: controlStages,
    templates: planTemplates,
    taskByStage: countByStage(tasks),
    taskByRole: countByRole(tasks),
    topTemplates: templateCounters(tasks),
    activeUmkm: new Set(tasks.filter((task) => task.templateCode === 'umkm_onboarding_basic').map((task) => task.semutId)).size,
    donationPrograms: tasks.filter((task) => task.templateCode === 'donation_execution_plan').length,
    lateTasks: tasks.filter((task) => task.isLate).slice(0, 6),
    validationTasks: tasks.filter((task) => task.needsValidation).slice(0, 6),
    tasks,
    salesOrders,
    milestones,
    balanceSheetLines,
    auditTrail: auditTrailFromTasks(tasks),
  };
}
