import type { OdooCustomField, PortalActor, RoleId, SemutAccount, SourceOfTruthRecord, StageSopGuide } from './types';
import { defaultKoloniCode, getKoloniNode } from './koloni';

export const compatibilityKoloniCode = defaultKoloniCode;

export function makePortalActor(account: SemutAccount): PortalActor {
  const cleanSemutId = account.semutId.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const activeAssignment = account.roleAssignments.find((assignment) => assignment.roleId === account.activeRoleId) || account.roleAssignments[0];
  const koloni = getKoloniNode(activeAssignment?.koloniCode);
  return {
    semutId: account.semutId,
    partnerExternalId: `namlah_partner.${cleanSemutId}`,
    userExternalId: `namlah_portal.${cleanSemutId}`,
    portalStatus: 'partner_only',
    koloniCode: koloni.code,
    wilayahCode: koloni.wilayahCode,
  };
}

export const customFields: OdooCustomField[] = [
  { model: 'project.project', name: 'x_namlah_colony_id', label: 'Namlah Colony', fieldType: 'many2one', relation: 'namlah.colony', purpose: 'Field matang setelah addon Namlah tersedia; v1 tetap memakai x_namlah_koloni_code.' },
  { model: 'project.project', name: 'x_namlah_parent_colony_id', label: 'Namlah Parent Colony', fieldType: 'many2one', relation: 'namlah.colony', purpose: 'Parent koloni bila project berada di scope child-parent yang approved.' },
  { model: 'project.project', name: 'x_namlah_geo_area_id', label: 'Namlah Geo Area', fieldType: 'many2one', relation: 'namlah.geo.area', purpose: 'Wilayah geografis; tidak menjadi batas akses utama.' },
  { model: 'project.project', name: 'x_namlah_visibility_policy', label: 'Namlah Visibility Policy', fieldType: 'selection', purpose: 'Policy koloni: exclusive atau inclusive.' },
  { model: 'project.project', name: 'x_namlah_koloni_code', label: 'Namlah Koloni Code', fieldType: 'char', purpose: 'Kode koloni yang menaungi dashboard Ratu Semut.' },
  { model: 'project.project', name: 'x_namlah_wilayah_code', label: 'Namlah Wilayah Code', fieldType: 'char', purpose: 'Wilayah terukur untuk dashboard lintas koloni.' },
  { model: 'project.project', name: 'x_namlah_template_code', label: 'Namlah Template Code', fieldType: 'char', purpose: 'Kode template asal project/task dibuat.' },
  { model: 'project.project', name: 'x_namlah_plan_code', label: 'Namlah Plan Code', fieldType: 'char', purpose: 'Kode instance rencana yang bisa diaudit.' },
  { model: 'project.project', name: 'x_namlah_source_app', label: 'Namlah Source App', fieldType: 'char', purpose: 'App asal project/template.' },
  { model: 'project.task', name: 'x_namlah_semut_id', label: 'Namlah Semut-ID', fieldType: 'char', purpose: 'Actor Semut-ID asli dari Superapp.' },
  { model: 'project.task', name: 'x_namlah_actor_partner_id', label: 'Namlah Actor Partner', fieldType: 'many2one', relation: 'res.partner', purpose: 'Partner portal user yang mewakili Semut-ID.' },
  { model: 'project.task', name: 'x_namlah_actor_user_id', label: 'Namlah Actor User', fieldType: 'many2one', relation: 'res.users', purpose: 'Portal user bila akses portal Odoo sudah aktif.' },
  { model: 'project.task', name: 'x_namlah_role_code', label: 'Namlah Role Code', fieldType: 'char', purpose: 'Role-ID aktif saat task/bukti dibuat.' },
  { model: 'project.task', name: 'x_namlah_colony_id', label: 'Namlah Colony', fieldType: 'many2one', relation: 'namlah.colony', purpose: 'Relasi matang ke koloni setelah addon Namlah tersedia.' },
  { model: 'project.task', name: 'x_namlah_parent_colony_id', label: 'Namlah Parent Colony', fieldType: 'many2one', relation: 'namlah.colony', purpose: 'Parent koloni approved untuk scope Ratu parent.' },
  { model: 'project.task', name: 'x_namlah_geo_area_id', label: 'Namlah Geo Area', fieldType: 'many2one', relation: 'namlah.geo.area', purpose: 'Wilayah geografis; dua koloni bisa berbagi area yang sama.' },
  { model: 'project.task', name: 'x_namlah_visibility_policy', label: 'Namlah Visibility Policy', fieldType: 'selection', purpose: 'Policy task/listing mengikuti konfigurasi koloni.' },
  { model: 'project.task', name: 'x_namlah_koloni_code', label: 'Namlah Koloni Code', fieldType: 'char', purpose: 'Koloni/project area pemilik task.' },
  { model: 'project.task', name: 'x_namlah_wilayah_code', label: 'Namlah Wilayah Code', fieldType: 'char', purpose: 'Wilayah terukur untuk filtering dashboard.' },
  { model: 'project.task', name: 'x_namlah_source_app', label: 'Namlah Source App', fieldType: 'char', purpose: 'Superapp atau role app asal record.' },
  { model: 'project.task', name: 'x_namlah_template_code', label: 'Namlah Template Code', fieldType: 'char', purpose: 'Template plan asal task dibuat.' },
  { model: 'project.task', name: 'x_namlah_plan_code', label: 'Namlah Plan Code', fieldType: 'char', purpose: 'Instance rencana/template untuk audit dan dashboard.' },
  { model: 'project.task', name: 'x_namlah_mobile_status', label: 'Namlah Mobile Status', fieldType: 'selection', purpose: 'Status mobile: draft, submitted, synced, blocked.' },
  { model: 'project.task', name: 'x_namlah_proof_status', label: 'Namlah Proof Status', fieldType: 'selection', purpose: 'Status bukti: none, required, submitted, approved.' },
  { model: 'project.task', name: 'x_namlah_sop_article_id', label: 'Namlah SOP Article', fieldType: 'many2one', relation: 'knowledge.article', purpose: 'SOP yang harus tampil untuk stage task.' },
  { model: 'project.task', name: 'x_namlah_sale_order_id', label: 'Namlah Sale Order', fieldType: 'many2one', relation: 'sale.order', purpose: 'Link ke transaksi kasir bila task adalah shift/audit kasir.' },
  { model: 'sale.order', name: 'x_namlah_semut_id', label: 'Namlah Semut-ID', fieldType: 'char', purpose: 'Semut-ID kasir/pembuat transaksi.' },
  { model: 'sale.order', name: 'x_namlah_cashier_partner_id', label: 'Namlah Cashier Partner', fieldType: 'many2one', relation: 'res.partner', purpose: 'Partner portal kasir.' },
  { model: 'sale.order', name: 'x_namlah_role_code', label: 'Namlah Role Code', fieldType: 'char', purpose: 'Role aktif, misalnya kasir.' },
  { model: 'sale.order', name: 'x_namlah_colony_id', label: 'Namlah Colony', fieldType: 'many2one', relation: 'namlah.colony', purpose: 'Relasi matang ke koloni pemilik order.' },
  { model: 'sale.order', name: 'x_namlah_geo_area_id', label: 'Namlah Geo Area', fieldType: 'many2one', relation: 'namlah.geo.area', purpose: 'Wilayah geografis untuk analitik non-akses.' },
  { model: 'sale.order', name: 'x_namlah_visibility_policy', label: 'Namlah Visibility Policy', fieldType: 'selection', purpose: 'Policy sharing order/report ringkas.' },
  { model: 'sale.order', name: 'x_namlah_project_id', label: 'Namlah Project', fieldType: 'many2one', relation: 'project.project', purpose: 'Project kasir/program yang menaungi transaksi.' },
  { model: 'sale.order', name: 'x_namlah_task_id', label: 'Namlah Task/Shift', fieldType: 'many2one', relation: 'project.task', purpose: 'Task shift/audit yang menaungi transaksi.' },
  { model: 'sale.order', name: 'x_namlah_outlet_code', label: 'Namlah Outlet Code', fieldType: 'char', purpose: 'Kode posko/outlet/kasir.' },
  { model: 'sale.order', name: 'x_namlah_source_app', label: 'Namlah Source App', fieldType: 'char', purpose: 'App asal transaksi.' },
  { model: 'sale.order', name: 'x_namlah_koloni_code', label: 'Namlah Koloni Code', fieldType: 'char', purpose: 'Koloni pemilik order.' },
  { model: 'sale.order', name: 'x_namlah_wilayah_code', label: 'Namlah Wilayah Code', fieldType: 'char', purpose: 'Wilayah pemilik order.' },
  { model: 'sale.order', name: 'x_namlah_template_code', label: 'Namlah Template Code', fieldType: 'char', purpose: 'Template/program asal order.' },
  { model: 'sale.order', name: 'x_namlah_plan_code', label: 'Namlah Plan Code', fieldType: 'char', purpose: 'Instance rencana/program asal order.' },
  { model: 'project.milestone', name: 'x_namlah_koloni_code', label: 'Namlah Koloni Code', fieldType: 'char', purpose: 'Koloni pemilik milestone.' },
  { model: 'project.milestone', name: 'x_namlah_wilayah_code', label: 'Namlah Wilayah Code', fieldType: 'char', purpose: 'Wilayah pemilik milestone.' },
  { model: 'project.milestone', name: 'x_namlah_source_app', label: 'Namlah Source App', fieldType: 'char', purpose: 'App asal milestone.' },
  { model: 'project.milestone', name: 'x_namlah_template_code', label: 'Namlah Template Code', fieldType: 'char', purpose: 'Template/program milestone.' },
  { model: 'project.milestone', name: 'x_namlah_plan_code', label: 'Namlah Plan Code', fieldType: 'char', purpose: 'Instance rencana milestone.' },
  { model: 'account.move', name: 'x_namlah_koloni_code', label: 'Namlah Koloni Code', fieldType: 'char', purpose: 'Koloni pemilik journal entry.' },
  { model: 'account.move', name: 'x_namlah_wilayah_code', label: 'Namlah Wilayah Code', fieldType: 'char', purpose: 'Wilayah pemilik journal entry.' },
  { model: 'account.move', name: 'x_namlah_source_app', label: 'Namlah Source App', fieldType: 'char', purpose: 'App asal journal entry.' },
  { model: 'account.move', name: 'x_namlah_template_code', label: 'Namlah Template Code', fieldType: 'char', purpose: 'Template/program journal entry.' },
  { model: 'account.move', name: 'x_namlah_plan_code', label: 'Namlah Plan Code', fieldType: 'char', purpose: 'Instance rencana journal entry.' },
  { model: 'account.move.line', name: 'x_namlah_koloni_code', label: 'Namlah Koloni Code', fieldType: 'char', purpose: 'Koloni untuk balance sheet ringkas.' },
  { model: 'account.move.line', name: 'x_namlah_wilayah_code', label: 'Namlah Wilayah Code', fieldType: 'char', purpose: 'Wilayah untuk balance sheet ringkas.' },
  { model: 'account.move.line', name: 'x_namlah_source_app', label: 'Namlah Source App', fieldType: 'char', purpose: 'App asal journal line.' },
  { model: 'account.move.line', name: 'x_namlah_template_code', label: 'Namlah Template Code', fieldType: 'char', purpose: 'Template/program journal line.' },
  { model: 'account.move.line', name: 'x_namlah_plan_code', label: 'Namlah Plan Code', fieldType: 'char', purpose: 'Instance rencana journal line.' },
  { model: 'project.task.type', name: 'x_namlah_sop_article_id', label: 'Namlah SOP Article', fieldType: 'many2one', relation: 'knowledge.article', purpose: 'Artikel SOP yang muncul pada stage.' },
  { model: 'project.task.type', name: 'x_namlah_sop_step_code', label: 'Namlah SOP Step Code', fieldType: 'char', purpose: 'Kode langkah mobile untuk stage.' },
  { model: 'project.task.type', name: 'x_namlah_required_proof', label: 'Namlah Required Proof', fieldType: 'selection', purpose: 'Jenis bukti wajib: foto, lokasi, catatan, barcode.' },
  { model: 'project.task.type', name: 'x_namlah_checklist_json', label: 'Namlah Checklist JSON', fieldType: 'json', purpose: 'Checklist ringkas yang dirender Superapp.' },
  { model: 'project.task.type', name: 'x_namlah_mobile_hint', label: 'Namlah Mobile Hint', fieldType: 'text', purpose: 'Instruksi pendek untuk anggota pada stage.' },
];

export const stageSopGuides: StageSopGuide[] = [
  {
    stage: 'Survey',
    sopArticleExternalId: 'namlah_sop.survey_umkm_lapangan',
    stepCode: 'SURVEY_FIELD_CHECK',
    requiredProof: 'foto + lokasi + catatan',
    checklist: ['Foto lokasi', 'Kontak penanggung jawab', 'Produk/aktivitas utama'],
    mobileHint: 'Lengkapi foto, GPS, dan catatan sebelum dikirim ke validasi.',
    nextActionLabel: 'Kirim bukti survey',
  },
  {
    stage: 'Validasi',
    sopArticleExternalId: 'namlah_sop.validasi_data_komunitas',
    stepCode: 'ADMIN_VALIDATE',
    requiredProof: 'catatan admin',
    checklist: ['Cek actor Semut-ID', 'Cek koloni/unit', 'Cek bukti wajib'],
    mobileHint: 'Ratu Koloni memutuskan apakah task siap lanjut atau perlu revisi.',
    nextActionLabel: 'Validasi task',
  },
  {
    stage: 'Pickup',
    sopArticleExternalId: 'namlah_sop.pickup_logistik',
    stepCode: 'RUNNER_PICKUP',
    requiredProof: 'foto + barcode',
    checklist: ['Scan paket', 'Foto barang', 'Konfirmasi outlet'],
    mobileHint: 'Bukti pickup harus terikat ke task rute atau sale order terkait.',
    nextActionLabel: 'Konfirmasi pickup',
  },
  {
    stage: 'Audit Kasir',
    sopArticleExternalId: 'namlah_sop.audit_shift_kasir',
    stepCode: 'CASHIER_SHIFT_AUDIT',
    requiredProof: 'catatan + rekap transaksi',
    checklist: ['Cek sale order', 'Cek kas shift', 'Link ke project kasir'],
    mobileHint: 'Sales order menjadi transaksi utama; task hanya shift/audit.',
    nextActionLabel: 'Tutup shift',
    warningText: 'Jangan menulis transaksi kasir sebagai task tanpa sale.order.',
  },
  {
    stage: 'Selesai',
    sopArticleExternalId: 'namlah_sop.penyelesaian_misi',
    stepCode: 'MISSION_DONE',
    requiredProof: 'approved proof',
    checklist: ['Proof approved', 'Actor tercatat', 'Laporan dampak terupdate'],
    mobileHint: 'Task selesai setelah bukti dan actor disetujui.',
    nextActionLabel: 'Selesaikan misi',
  },
];

const roleStage: Record<RoleId, string> = {
  member: 'Selesai',
  surveyor: 'Survey',
  kurir: 'Pickup',
  kasir: 'Audit Kasir',
  umkm: 'Validasi',
  admin: 'Validasi',
  koperasi: 'Selesai',
};

const sourceModels: Record<RoleId, 'project.task' | 'sale.order'> = {
  member: 'project.task',
  surveyor: 'project.task',
  kurir: 'project.task',
  kasir: 'sale.order',
  umkm: 'project.task',
  admin: 'project.task',
  koperasi: 'project.task',
};

export function getStageGuide(roleId: RoleId): StageSopGuide {
  const stage = roleStage[roleId];
  return stageSopGuides.find((guide) => guide.stage === stage) || stageSopGuides[0];
}

export function getSourceOfTruth(roleId: RoleId): SourceOfTruthRecord {
  const model = sourceModels[roleId];
  const stageGuide = getStageGuide(roleId);
  const isKasir = roleId === 'kasir';
  return {
    id: `source-${roleId}`,
    roleId,
    model,
    title: isKasir ? 'Sale Order kasir terikat shift task' : 'Project Task misi koloni',
    project: isKasir ? 'Kasir Koloni Kejaksan' : 'Misi Koloni Kejaksan',
    stage: stageGuide.stage,
    task: isKasir ? 'Shift Kasir Posko A / Audit Harian' : `${stageGuide.stage} / ${roleId}`,
    saleOrder: isKasir ? 'SO-KASIR-POSKO-A-0007' : undefined,
    linkedRecord: isKasir ? 'sale.order -> project.task shift' : 'project.task -> knowledge.article SOP',
    sop: stageGuide,
    fields: [
      { label: 'Actor', value: 'x_namlah_semut_id' },
      { label: 'Role', value: 'x_namlah_role_code' },
      { label: 'Koloni', value: 'x_namlah_koloni_code' },
      { label: 'Wilayah', value: 'x_namlah_wilayah_code' },
      { label: 'SOP', value: 'x_namlah_sop_article_id' },
    ],
  };
}

export function getCustomFieldsByModel(model: OdooCustomField['model']) {
  return customFields.filter((field) => field.model === model);
}
