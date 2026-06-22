import { roleConfigs } from './roleConfig';
import { defaultKoloniCode, defaultWilayahCode, getKoloniNode } from './koloni';
import { makePortalIdentity } from './portalIdentity';
import type {
  NamlahControlStage,
  NamlahControlTask,
  NamlahKanbanFlow,
  NamlahMobileStatus,
  NamlahOdooEnvelope,
  NamlahPlanTemplate,
  NamlahProjectTemplateCode,
  NamlahTaskBlueprint,
  NamlahTaskProofStatus,
  RoleId,
  SemutAccount,
} from './types';

export const odooServiceUser = 'namlah.integration.service';

export const controlStages: NamlahControlStage[] = [
  { code: 'umkm_baru_daftar', label: 'Baru Daftar', flow: 'umkm_onboarding', sequence: 10, requiredProof: 'semut_id', mobileHint: 'Semut-ID dan role UMKM dibuat melalui Superapp.', allowedRoles: ['umkm', 'admin'] },
  { code: 'umkm_lengkapi_profil', label: 'Lengkapi Profil', flow: 'umkm_onboarding', sequence: 20, requiredProof: 'lokasi + kontak', mobileHint: 'Lengkapi lokasi, kontak owner, dan kategori usaha.', allowedRoles: ['umkm', 'surveyor', 'admin'] },
  { code: 'umkm_data_produk', label: 'Data Produk', flow: 'umkm_onboarding', sequence: 30, requiredProof: 'foto + harga', mobileHint: 'Produk, foto, harga, dan stok awal harus siap dicek.', allowedRoles: ['umkm', 'surveyor', 'admin'] },
  { code: 'umkm_validasi_survey', label: 'Validasi Survey', flow: 'umkm_onboarding', sequence: 40, requiredProof: 'catatan admin', mobileHint: 'Surveyor dan admin memastikan data layak masuk katalog.', allowedRoles: ['surveyor', 'admin'] },
  { code: 'umkm_siap_jual', label: 'Siap Jual', flow: 'umkm_onboarding', sequence: 50, requiredProof: 'approval katalog', mobileHint: 'UMKM siap menerima order pertama dari koloni.', allowedRoles: ['umkm', 'admin', 'member'] },
  { code: 'umkm_aktif', label: 'Aktif', flow: 'umkm_onboarding', sequence: 60, fold: true, requiredProof: 'aktivitas order', mobileHint: 'Aktivitas usaha dipantau melalui order, stok, dan bukti kerja.', allowedRoles: ['umkm', 'admin', 'koperasi'] },
  { code: 'umkm_perlu_perbaikan', label: 'Perlu Perbaikan', flow: 'umkm_onboarding', sequence: 70, requiredProof: 'catatan revisi', mobileHint: 'Task kembali ke owner bila data atau bukti belum kuat.', allowedRoles: ['umkm', 'surveyor', 'admin'] },
  { code: 'promo_rencana', label: 'Rencana', flow: 'umkm_promotion', sequence: 110, requiredProof: 'brief promo', mobileHint: 'Pilih produk, target, dan periode promosi.', allowedRoles: ['umkm', 'admin', 'koperasi'] },
  { code: 'promo_konten_dibuat', label: 'Konten Dibuat', flow: 'umkm_promotion', sequence: 120, requiredProof: 'asset konten', mobileHint: 'Konten foto/video/copy promo sudah siap disebar.', allowedRoles: ['umkm', 'admin'] },
  { code: 'promo_diskon_aktif', label: 'Diskon Aktif', flow: 'umkm_promotion', sequence: 130, requiredProof: 'harga promo', mobileHint: 'Harga promo tercatat dan bisa diaudit.', allowedRoles: ['umkm', 'kasir', 'admin'] },
  { code: 'promo_disebar', label: 'Disebar', flow: 'umkm_promotion', sequence: 140, requiredProof: 'share proof', mobileHint: 'Konten dibagikan oleh role eksekutor.', allowedRoles: ['member', 'umkm', 'admin'] },
  { code: 'promo_review_masuk', label: 'Review Masuk', flow: 'umkm_promotion', sequence: 150, requiredProof: 'review produk', mobileHint: 'Review member dikumpulkan untuk evaluasi kualitas.', allowedRoles: ['member', 'umkm', 'admin'] },
  { code: 'promo_selesai', label: 'Selesai', flow: 'umkm_promotion', sequence: 160, fold: true, requiredProof: 'rekap hasil', mobileHint: 'Hasil promosi masuk laporan koloni.', allowedRoles: ['umkm', 'admin', 'koperasi'] },
  { code: 'donasi_template_tersedia', label: 'Template Tersedia', flow: 'donation_program', sequence: 210, requiredProof: 'template plan', mobileHint: 'Rencana siap dipilih pemberi donasi.', allowedRoles: ['admin', 'koperasi'] },
  { code: 'donasi_dipilih_donatur', label: 'Dipilih Donatur', flow: 'donation_program', sequence: 220, requiredProof: 'intent donasi', mobileHint: 'Donatur memilih template dan target dampak.', allowedRoles: ['member', 'koperasi', 'admin'] },
  { code: 'donasi_menunggu_dana', label: 'Menunggu Dana', flow: 'donation_program', sequence: 230, requiredProof: 'komitmen dana', mobileHint: 'Program menunggu dana atau approval bendahara.', allowedRoles: ['koperasi', 'admin'] },
  { code: 'donasi_eksekusi', label: 'Eksekusi', flow: 'donation_program', sequence: 240, requiredProof: 'bukti kerja', mobileHint: 'Eksekutor menjalankan task lapangan.', allowedRoles: ['surveyor', 'kurir', 'umkm', 'admin'] },
  { code: 'donasi_bukti_terkumpul', label: 'Bukti Terkumpul', flow: 'donation_program', sequence: 250, requiredProof: 'foto + catatan', mobileHint: 'Bukti dikumpulkan sebelum laporan final.', allowedRoles: ['surveyor', 'kurir', 'admin'] },
  { code: 'donasi_laporan', label: 'Laporan', flow: 'donation_program', sequence: 260, requiredProof: 'laporan dampak', mobileHint: 'Ringkasan dampak siap dibaca donatur dan koloni.', allowedRoles: ['koperasi', 'admin'] },
  { code: 'donasi_selesai', label: 'Selesai', flow: 'donation_program', sequence: 270, fold: true, requiredProof: 'approval laporan', mobileHint: 'Program selesai dan bisa masuk arsip dampak.', allowedRoles: ['koperasi', 'admin', 'member'] },
];

export const planTemplates: NamlahPlanTemplate[] = [
  {
    code: 'cashier_transaction_flow',
    title: 'Kasir Transaksi Koloni',
    category: 'Cashier',
    sourceApp: 'namlah-kasir',
    roleScope: ['kasir', 'admin'],
    projectName: 'Kasir Koloni',
    description: 'Template project kasir: satu task kasir per Semut-ID, semua sale.order transaksi ditautkan ke task kasir itu.',
    defaultFlow: 'umkm_promotion',
    impactMetric: 'Transaksi kasir',
    tasks: [
      { code: 'cashier_shift_task', title: 'Task Kasir Semut-ID', roleCode: 'kasir', stageCode: 'promo_diskon_aktif', description: 'Task induk kasir untuk smart button transaksi dan audit shift.', proof: 'sale.order linked' },
      { code: 'cashier_audit_task', title: 'Audit transaksi kasir', roleCode: 'admin', stageCode: 'promo_selesai', description: 'Ratu Koloni memantau transaksi yang masuk dari POS kasir.', proof: 'rekap transaksi' },
    ],
  },
  {
    code: 'member_shopping_flow',
    title: 'Belanja Koloni',
    category: 'Commerce',
    sourceApp: 'namlah-member',
    roleScope: ['member', 'kasir', 'kurir', 'admin'],
    projectName: 'Belanja Koloni',
    description: 'Template belanja: order member, proses kasir, dan pengiriman kurir berada dalam project koloni yang sama.',
    defaultFlow: 'donation_program',
    impactMetric: 'Order belanja selesai',
    tasks: [
      { code: 'shopping_order', title: 'Order belanja member', roleCode: 'member', stageCode: 'donasi_dipilih_donatur', description: 'Member membuat intent belanja pada koloni.', proof: 'order intent' },
      { code: 'shopping_cashier', title: 'Proses kasir', roleCode: 'kasir', stageCode: 'donasi_menunggu_dana', description: 'Kasir mengubah intent belanja menjadi sale.order.', proof: 'sale.order' },
      { code: 'shopping_delivery', title: 'Pengiriman belanja', roleCode: 'kurir', stageCode: 'donasi_eksekusi', description: 'Kurir mengirim ke kontak pengiriman yang diisi saat order.', proof: 'foto + catatan' },
      { code: 'shopping_report', title: 'Laporan belanja', roleCode: 'admin', stageCode: 'donasi_laporan', description: 'Ratu memantau nilai transaksi dan status kirim.', proof: 'laporan order' },
    ],
  },
  {
    code: 'umkm_onboarding_basic',
    title: 'UMKM Onboarding Basic',
    category: 'Onboarding',
    sourceApp: 'namlah-umkm',
    roleScope: ['umkm', 'surveyor', 'admin'],
    projectName: 'Onboarding UMKM Koloni',
    description: 'Template wajib saat owner UMKM membuat Semut-ID dan mendaftar role UMKM.',
    defaultFlow: 'umkm_onboarding',
    impactMetric: 'UMKM siap jual',
    tasks: [
      {
        code: 'onboard_root',
        title: 'Onboarding UMKM',
        roleCode: 'umkm',
        stageCode: 'umkm_baru_daftar',
        description: 'Root task onboarding untuk satu UMKM baru.',
        proof: 'semut_id + role_id',
        children: [
          { code: 'lokasi', title: 'Isi data lokasi', roleCode: 'umkm', stageCode: 'umkm_lengkapi_profil', description: 'Alamat, wilayah, titik layanan, dan jam operasional.', proof: 'lokasi' },
          { code: 'foto_toko', title: 'Upload foto toko', roleCode: 'surveyor', stageCode: 'umkm_lengkapi_profil', description: 'Foto tampak depan dan aktivitas produksi.', proof: 'foto' },
          { code: 'produk', title: 'Input produk awal', roleCode: 'umkm', stageCode: 'umkm_data_produk', description: 'Nama produk, kategori, harga, stok, dan foto.', proof: 'foto + harga' },
          { code: 'validasi', title: 'Validasi admin koloni', roleCode: 'admin', stageCode: 'umkm_validasi_survey', description: 'Cek kelayakan katalog dan catatan revisi.', proof: 'approval' },
        ],
      },
    ],
  },
  {
    code: 'umkm_promotion_sprint',
    title: 'UMKM Promotion Sprint',
    category: 'Promotion',
    sourceApp: 'namlah-umkm',
    roleScope: ['umkm', 'member', 'admin'],
    projectName: 'Promotion Sprint Koloni',
    description: 'Template promosi produk UMKM dari rencana, konten, diskon, distribusi, sampai review.',
    defaultFlow: 'umkm_promotion',
    impactMetric: 'Konten dan review',
    tasks: [
      { code: 'promo_brief', title: 'Pilih produk promosi', roleCode: 'umkm', stageCode: 'promo_rencana', description: 'Tentukan produk, stok, target, dan periode.', proof: 'brief promo' },
      { code: 'promo_content', title: 'Buat konten promosi', roleCode: 'umkm', stageCode: 'promo_konten_dibuat', description: 'Siapkan foto, caption, dan materi share.', proof: 'asset konten' },
      { code: 'promo_discount', title: 'Aktifkan diskon', roleCode: 'kasir', stageCode: 'promo_diskon_aktif', description: 'Pastikan harga promo cocok dengan POS/order.', proof: 'harga promo' },
      { code: 'promo_share', title: 'Share konten ke jaringan', roleCode: 'member', stageCode: 'promo_disebar', description: 'Sebarkan konten melalui kanal koloni.', proof: 'share proof' },
      { code: 'promo_review', title: 'Kumpulkan review produk', roleCode: 'member', stageCode: 'promo_review_masuk', description: 'Review member menjadi bahan evaluasi.', proof: 'review produk' },
    ],
  },
  {
    code: 'survey_lokasi',
    title: 'Survey Lokasi',
    category: 'Survey',
    sourceApp: 'namlah-surveyor',
    roleScope: ['surveyor', 'admin'],
    projectName: 'Survey Lokasi Koloni',
    description: 'Template kunjungan lapangan untuk UMKM, titik pickup, outlet, atau lokasi program.',
    defaultFlow: 'umkm_onboarding',
    impactMetric: 'Lokasi tervalidasi',
    tasks: [
      { code: 'survey_visit', title: 'Kunjungan lokasi', roleCode: 'surveyor', stageCode: 'umkm_lengkapi_profil', description: 'Ambil foto, GPS, kontak, dan catatan lapangan.', proof: 'foto + lokasi' },
      { code: 'survey_review', title: 'Review hasil survey', roleCode: 'admin', stageCode: 'umkm_validasi_survey', description: 'Admin memutuskan lanjut, revisi, atau arsip.', proof: 'catatan admin' },
    ],
  },
  {
    code: 'setup_kasir',
    title: 'Setup Kasir',
    category: 'Operations',
    sourceApp: 'namlah-kasir',
    roleScope: ['kasir', 'admin'],
    projectName: 'Setup Kasir Koloni',
    description: 'Template kesiapan outlet, produk POS, shift, dan audit kasir.',
    defaultFlow: 'umkm_onboarding',
    impactMetric: 'Outlet siap transaksi',
    tasks: [
      { code: 'kasir_outlet', title: 'Siapkan outlet kasir', roleCode: 'kasir', stageCode: 'umkm_lengkapi_profil', description: 'Tentukan outlet, perangkat, operator, dan jam shift.', proof: 'foto outlet' },
      { code: 'kasir_produk', title: 'Sinkron produk POS', roleCode: 'kasir', stageCode: 'umkm_data_produk', description: 'Produk, barcode, harga, dan stok masuk daftar jual.', proof: 'daftar produk' },
      { code: 'kasir_audit', title: 'Audit shift pertama', roleCode: 'admin', stageCode: 'umkm_validasi_survey', description: 'Cek transaksi awal dan catatan kas.', proof: 'rekap shift' },
    ],
  },
  {
    code: 'kurir_delivery',
    title: 'Kurir Delivery',
    category: 'Logistics',
    sourceApp: 'namlah-kurir',
    roleScope: ['kurir', 'admin'],
    projectName: 'Delivery Koloni',
    description: 'Template pickup, rute, bukti sampai, dan kendala pengiriman.',
    defaultFlow: 'donation_program',
    impactMetric: 'Paket selesai',
    tasks: [
      { code: 'delivery_pickup', title: 'Pickup paket', roleCode: 'kurir', stageCode: 'donasi_eksekusi', description: 'Ambil paket di outlet atau gudang.', proof: 'scan + foto' },
      { code: 'delivery_drop', title: 'Serah terima paket', roleCode: 'kurir', stageCode: 'donasi_bukti_terkumpul', description: 'Foto sampai dan catatan penerima.', proof: 'foto + catatan' },
    ],
  },
  {
    code: 'donation_execution_plan',
    title: 'Program Donasi / Eksekusi Rencana',
    category: 'Donation',
    sourceApp: 'namlah-koperasi',
    roleScope: ['member', 'koperasi', 'admin', 'surveyor', 'kurir', 'umkm'],
    projectName: 'Program Donasi Koloni',
    description: 'Template rencana yang dipilih pemberi donasi, dieksekusi role lapangan, lalu dilaporkan.',
    defaultFlow: 'donation_program',
    impactMetric: 'Program berdampak',
    tasks: [
      { code: 'donation_select', title: 'Donatur memilih template', roleCode: 'member', stageCode: 'donasi_dipilih_donatur', description: 'Pilih program, wilayah, dan target dampak.', proof: 'intent donasi' },
      { code: 'donation_fund', title: 'Konfirmasi dana program', roleCode: 'koperasi', stageCode: 'donasi_menunggu_dana', description: 'Bendahara/admin memverifikasi dana.', proof: 'komitmen dana' },
      { code: 'donation_execute', title: 'Eksekusi rencana lapangan', roleCode: 'surveyor', stageCode: 'donasi_eksekusi', description: 'Role eksekutor menjalankan task sesuai SOP.', proof: 'bukti kerja' },
      { code: 'donation_report', title: 'Laporan dampak', roleCode: 'koperasi', stageCode: 'donasi_laporan', description: 'Bukti dan hasil program diringkas untuk dashboard.', proof: 'laporan dampak' },
    ],
  },
];

function stageByCode(code: string) {
  return controlStages.find((stage) => stage.code === code) || controlStages[0];
}

function flowStages(flow: NamlahKanbanFlow) {
  return controlStages.filter((stage) => stage.flow === flow).sort((a, b) => a.sequence - b.sequence);
}

function flattenBlueprint(template: NamlahPlanTemplate, semutId: string, seed: string, rootTitle?: string, koloniCode = defaultKoloniCode): NamlahControlTask[] {
  const tasks: NamlahControlTask[] = [];
  const koloni = getKoloniNode(koloniCode);

  function visit(blueprint: NamlahTaskBlueprint, parentId: string | undefined, indexPath: string) {
    const stage = stageByCode(blueprint.stageCode);
    const id = `task_${seed}_${blueprint.code}_${indexPath}`.replace(/[^a-zA-Z0-9_]+/g, '_');
    const children = blueprint.children || [];
    tasks.push({
      id,
      title: blueprint.code === 'onboard_root' && rootTitle ? rootTitle : blueprint.title,
      project: template.projectName,
      parentId,
      stageCode: stage.code,
      stageLabel: stage.label,
      roleCode: blueprint.roleCode,
      semutId,
      koloniCode: koloni.code,
      wilayahCode: koloni.wilayahCode || defaultWilayahCode,
      sourceApp: template.sourceApp,
      templateCode: template.code,
      planCode: `${template.code}.${seed}`,
      proofStatus: stage.requiredProof === 'semut_id' ? 'submitted' : 'required',
      mobileStatus: stage.fold ? 'synced' : 'submitted',
      deadline: '2026-06-24',
      priority: blueprint.roleCode === 'admin' ? '1' : '0',
      childrenCount: children.length,
      needsValidation: stage.code.includes('validasi') || stage.code.includes('laporan'),
      isLate: stage.code.includes('perlu_perbaikan'),
    });
    children.forEach((child, childIndex) => visit(child, id, `${indexPath}_${childIndex + 1}`));
  }

  template.tasks.forEach((task, index) => visit(task, undefined, `${index + 1}`));
  return tasks;
}

export function getTemplate(code: string) {
  return planTemplates.find((template) => template.code === code) || planTemplates[0];
}

function envelope(params: {
  actorSemutId: string;
  roleCode: RoleId;
  sourceApp: string;
  targetModel: NamlahOdooEnvelope['targetModel'];
  koloniCode?: string;
  fields: NamlahOdooEnvelope['fields'];
}): NamlahOdooEnvelope {
  const koloni = getKoloniNode(params.koloniCode);
  return {
    serviceUser: odooServiceUser,
    targetModel: params.targetModel,
    sourceApp: params.sourceApp,
    actorSemutId: params.actorSemutId,
    roleCode: params.roleCode,
    koloniCode: koloni.code,
    wilayahCode: koloni.wilayahCode || defaultWilayahCode,
    fields: {
      x_namlah_semut_id: params.actorSemutId,
      x_namlah_role_code: params.roleCode,
      x_namlah_koloni_code: koloni.code,
      x_namlah_wilayah_code: koloni.wilayahCode || defaultWilayahCode,
      x_namlah_source_app: params.sourceApp,
      ...params.fields,
    },
  };
}

export function buildSemutRegistration(input: Partial<SemutAccount> & { koloniCode?: string; pin?: string }) {
  const semutId = String(input.semutId);
  const koloni = getKoloniNode(input.koloniCode);
  const portal = makePortalIdentity(semutId);
  return {
    ok: true,
    actor: {
      semutId,
      displayName: input.displayName || semutId,
      portalLogin: portal.portalLogin,
      portalStatus: portal.portalStatus,
      partnerExternalId: portal.partnerExternalId,
      userExternalId: portal.userExternalId,
      emailRequired: portal.emailRequired,
      emailVerificationStatus: portal.emailVerificationStatus,
      defaultRole: 'member' satisfies RoleId,
      koloniCode: koloni.code,
      wilayahCode: koloni.wilayahCode || defaultWilayahCode,
    },
    odoo: envelope({
      actorSemutId: semutId,
      roleCode: 'member',
      sourceApp: 'namlah-superapp',
      targetModel: 'res.partner',
      koloniCode: koloni.code,
      fields: {
        name: input.displayName || semutId,
        ref: semutId,
        login: portal.portalLogin,
        portal_login: portal.portalLogin,
        portal_password: input.pin || null,
        partner_external_id: portal.partnerExternalId,
        user_external_id: portal.userExternalId,
        portal_status: portal.portalStatus,
        email_required: portal.emailRequired,
        email_verification_status: portal.emailVerificationStatus,
      },
    }),
  };
}

export function buildRoleApplication(input: { semutId?: string; roleCode?: RoleId; sourceApp?: string; koloniCode?: string }) {
  const roleCode = input.roleCode || 'member';
  const semutId = String(input.semutId);
  const koloni = getKoloniNode(input.koloniCode);
  return {
    ok: true,
    roleApplication: {
      semutId,
      roleCode,
      status: roleCode === 'admin' ? 'needs_admin_approval' : 'submitted',
      koloniCode: koloni.code,
      wilayahCode: koloni.wilayahCode || defaultWilayahCode,
    },
    odoo: envelope({
      actorSemutId: semutId,
      roleCode,
      sourceApp: input.sourceApp || 'namlah-superapp',
      targetModel: 'project.task',
      koloniCode: koloni.code,
      fields: {
        name: `Role-ID application: ${roleConfigs[roleCode].label}`,
        x_namlah_mobile_status: 'submitted',
        x_namlah_proof_status: 'required',
        x_namlah_template_code: 'umkm_onboarding_basic',
        x_namlah_plan_code: `role_application.${semutId}.${roleCode}`,
      },
    }),
  };
}

export function buildUmkmOnboarding(input: { semutId?: string; businessName?: string; ownerName?: string; koloniCode?: string }) {
  const template = getTemplate('umkm_onboarding_basic');
  const semutId = String(input.semutId);
  const koloni = getKoloniNode(input.koloniCode);
  const tasks = flattenBlueprint(template, semutId, semutId.toLowerCase().replace(/[^a-z0-9]+/g, '_'), `Onboarding UMKM ${input.businessName || input.ownerName || semutId}`, koloni.code);
  return {
    ok: true,
    template,
    tasks,
    odoo: envelope({
      actorSemutId: semutId,
      roleCode: 'umkm',
      sourceApp: 'namlah-umkm',
      targetModel: 'project.task',
      koloniCode: koloni.code,
      fields: {
        name: tasks[0]?.title || 'Onboarding UMKM',
        x_namlah_template_code: template.code,
        x_namlah_plan_code: `${template.code}.${semutId}`,
        x_namlah_mobile_status: 'submitted',
        x_namlah_proof_status: 'required',
      },
    }),
  };
}

export function buildProjectFromTemplate(input: { semutId?: string; roleCode?: RoleId; templateCode?: NamlahProjectTemplateCode; planName?: string; koloniCode?: string }) {
  const template = getTemplate(String(input.templateCode));
  const roleCode = input.roleCode || template.roleScope[0] || 'admin';
  const semutId = String(input.semutId);
  const koloni = getKoloniNode(input.koloniCode);
  const seed = `${template.code}_${semutId}`.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const tasks = flattenBlueprint(template, semutId, seed, input.planName, koloni.code);
  return {
    ok: true,
    template,
    project: {
      name: input.planName || template.projectName,
      templateCode: template.code,
      taskCount: tasks.length,
      koloniCode: koloni.code,
      wilayahCode: koloni.wilayahCode || defaultWilayahCode,
    },
    tasks,
    odoo: envelope({
      actorSemutId: semutId,
      roleCode,
      sourceApp: template.sourceApp,
      targetModel: 'project.project',
      koloniCode: koloni.code,
      fields: {
        name: input.planName || template.projectName,
        x_namlah_template_code: template.code,
        x_namlah_plan_code: `${template.code}.${seed}`,
      },
    }),
  };
}

export function buildTaskStatusUpdate(taskId: string, input: {
  semutId?: string;
  roleCode?: RoleId;
  koloniCode?: string;
  stageCode?: string;
  mobileStatus?: NamlahMobileStatus;
  templateCode?: NamlahProjectTemplateCode;
  planCode?: string;
  taskTitle?: string;
  sourceApp?: string;
}) {
  const stage = stageByCode(input.stageCode || controlStages[0].code);
  const roleCode = input.roleCode || 'member';
  const semutId = String(input.semutId);
  const koloni = getKoloniNode(input.koloniCode);
  const cleanTaskId = taskId.replace(/^namlah_task\./, '');
  const sourceApp = input.sourceApp || 'namlah-superapp';
  const task: NamlahControlTask = {
    id: cleanTaskId,
    title: input.taskTitle || cleanTaskId,
    project: 'Odoo Project',
    stageCode: stage.code,
    stageLabel: stage.label,
    roleCode,
    semutId,
    koloniCode: koloni.code,
    wilayahCode: koloni.wilayahCode || defaultWilayahCode,
    sourceApp,
    templateCode: input.templateCode || 'umkm_onboarding_basic',
    planCode: input.planCode || cleanTaskId,
    proofStatus: 'none',
    mobileStatus: input.mobileStatus || 'synced',
    deadline: '',
    priority: '0',
    childrenCount: 0,
    needsValidation: false,
    isLate: false,
  };
  return {
    ok: true,
    task: {
      ...task,
    },
    odoo: envelope({
      actorSemutId: semutId,
      roleCode,
      sourceApp,
      targetModel: 'project.task',
      koloniCode: task.koloniCode,
      fields: {
        id: task.id,
        stage_id_external_id: `namlah_control.stage_${stage.code}`,
        x_namlah_mobile_status: input.mobileStatus || 'synced',
        x_namlah_template_code: task.templateCode,
        x_namlah_plan_code: task.planCode,
      },
    }),
  };
}

export function buildTaskProof(taskId: string, input: {
  semutId?: string;
  roleCode?: RoleId;
  koloniCode?: string;
  proofStatus?: NamlahTaskProofStatus;
  note?: string;
  sourceApp?: string;
}) {
  const roleCode = input.roleCode || 'member';
  const semutId = String(input.semutId);
  const koloni = getKoloniNode(input.koloniCode);
  const cleanTaskId = taskId.replace(/^namlah_task\./, '');
  const taskExternalId = `namlah_task.${cleanTaskId}`;
  return {
    ok: true,
    proof: {
      taskId: taskExternalId,
      status: input.proofStatus || 'submitted',
      note: input.note || `Proof submitted for ${taskExternalId}`,
    },
    odoo: envelope({
      actorSemutId: semutId,
      roleCode,
      sourceApp: input.sourceApp || 'namlah-superapp',
      targetModel: 'project.task.proof',
      koloniCode: koloni.code,
      fields: {
        project_task_external_id: taskExternalId,
        x_namlah_proof_status: input.proofStatus || 'submitted',
        note: input.note || null,
      },
    }),
  };
}

export function buildCashierTransaction(input: {
  semutId: string;
  koloniCode: string;
  amount: number;
  deliveryCustomerName: string;
  deliveryPhone?: string;
  deliveryAddress?: string;
  note?: string;
  transactionCode?: string;
}) {
  const koloni = getKoloniNode(input.koloniCode);
  const transactionCode = input.transactionCode || `cashier.${koloni.code}.${input.semutId}.${Date.now()}`;
  return {
    ok: true,
    transaction: {
      semutId: input.semutId,
      roleCode: 'kasir' satisfies RoleId,
      koloniCode: koloni.code,
      wilayahCode: koloni.wilayahCode || defaultWilayahCode,
      amount: input.amount,
      deliveryCustomerName: input.deliveryCustomerName,
      transactionCode,
    },
    odoo: envelope({
      actorSemutId: input.semutId,
      roleCode: 'kasir',
      sourceApp: 'namlah-kasir',
      targetModel: 'sale.order',
      koloniCode: koloni.code,
      fields: {
        name: `Transaksi Kasir ${input.semutId}`,
        x_namlah_template_code: 'cashier_transaction_flow',
        x_namlah_plan_code: transactionCode,
        amount_total_input: input.amount,
        delivery_customer_name: input.deliveryCustomerName,
        delivery_phone: input.deliveryPhone || '',
        delivery_address: input.deliveryAddress || '',
        note: input.note || '',
      },
    }),
  };
}

export function stagesForFlow(flow: NamlahKanbanFlow) {
  return flowStages(flow);
}
