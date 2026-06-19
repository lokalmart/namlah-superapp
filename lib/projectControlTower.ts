import { roleConfigs } from './mockData';
import { sarangCode, tenantCode } from './odooArchitecture';
import { defaultKoloniCode, defaultWilayahCode, getKoloniScope } from './koloni';
import type {
  NamlahAuditEvent,
  NamlahBalanceSheetLine,
  NamlahControlStage,
  NamlahControlTask,
  NamlahDashboardMetric,
  NamlahKanbanFlow,
  NamlahKoloniDashboard,
  NamlahMilestoneRow,
  NamlahMobileStatus,
  NamlahOdooEnvelope,
  NamlahPlanTemplate,
  NamlahProjectTemplateCode,
  NamlahRatuView,
  NamlahSalesOrder,
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

function flattenBlueprint(template: NamlahPlanTemplate, semutId: string, seed: string, rootTitle?: string): NamlahControlTask[] {
  const tasks: NamlahControlTask[] = [];

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
      koloniCode: defaultKoloniCode,
      wilayahCode: defaultWilayahCode,
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

export const controlTasks: NamlahControlTask[] = [
  ...flattenBlueprint(planTemplates[0], 'SMT-UMKM-BUSITI', 'bu_siti', 'Onboarding UMKM Bu Siti'),
  ...flattenBlueprint(planTemplates[1], 'SMT-UMKM-BUSITI', 'promo_keripik'),
  ...flattenBlueprint(planTemplates[5], 'SMT-DONATUR-001', 'paket_foto_produk'),
].map((task, index) => {
  const stageOverrides = ['umkm_lengkapi_profil', 'umkm_data_produk', 'umkm_validasi_survey', 'promo_disebar', 'donasi_eksekusi', 'donasi_laporan'];
  const override = stageOverrides[index % stageOverrides.length];
  const stage = task.parentId ? stageByCode(task.stageCode) : stageByCode(override);
  const proofStatus: NamlahTaskProofStatus = index % 5 === 0 ? 'approved' : index % 3 === 0 ? 'submitted' : task.proofStatus;
  const koloniCode = index % 3 === 0 ? 'koloni_kejaksan_demo' : index % 3 === 1 ? 'koloni_kedawung_demo' : 'koloni_harjamukti_demo';
  const wilayahCode = index % 3 === 0 ? 'wilayah_kecamatan_kejaksan_demo' : index % 3 === 1 ? 'wilayah_kecamatan_kedawung_demo' : 'wilayah_kecamatan_harjamukti_demo';
  return {
    ...task,
    koloniCode,
    wilayahCode,
    stageCode: stage.code,
    stageLabel: stage.label,
    proofStatus,
    isLate: index === 4 || index === 11,
    needsValidation: task.needsValidation || proofStatus === 'submitted',
  };
});

export const salesOrders: NamlahSalesOrder[] = [
  { id: 'so_001', orderNumber: 'SO-KJX-0001', customer: 'Member Kejaksan A', sourceApp: 'namlah-kasir', amount: 'Rp428.000', status: 'Sale Order', linkedTask: 'Onboarding UMKM Bu Siti', date: '2026-06-19', koloniCode: 'koloni_kejaksan_demo' },
  { id: 'so_002', orderNumber: 'SO-KJX-0002', customer: 'Warung Bu Siti', sourceApp: 'namlah-umkm', amount: 'Rp215.000', status: 'Invoice Draft', linkedTask: 'Promo Keripik', date: '2026-06-19', koloniCode: 'koloni_kejaksan_demo' },
  { id: 'so_003', orderNumber: 'SO-KDW-0001', customer: 'Member Kedawung B', sourceApp: 'namlah-kasir', amount: 'Rp612.000', status: 'Delivered', linkedTask: 'Delivery Koloni', date: '2026-06-18', koloniCode: 'koloni_kedawung_demo' },
  { id: 'so_004', orderNumber: 'SO-HJM-0001', customer: 'Koperasi Harjamukti', sourceApp: 'namlah-koperasi', amount: 'Rp1.240.000', status: 'Confirmed', linkedTask: 'Program Donasi', date: '2026-06-18', koloniCode: 'koloni_harjamukti_demo' },
];

export const milestones: NamlahMilestoneRow[] = [
  { id: 'ms_001', milestone: 'UMKM Siap Jual', project: 'Onboarding UMKM Koloni', deadline: '2026-06-24', reached: false, progress: '62%', koloniCode: 'koloni_kejaksan_demo' },
  { id: 'ms_002', milestone: 'Promosi Pertama', project: 'Promotion Sprint Koloni', deadline: '2026-06-25', reached: false, progress: '48%', koloniCode: 'koloni_kejaksan_demo' },
  { id: 'ms_003', milestone: 'Delivery Stabil', project: 'Delivery Koloni', deadline: '2026-06-26', reached: false, progress: '71%', koloniCode: 'koloni_kedawung_demo' },
  { id: 'ms_004', milestone: 'Laporan Dampak Donasi', project: 'Program Donasi Koloni', deadline: '2026-06-30', reached: false, progress: '36%', koloniCode: 'koloni_harjamukti_demo' },
];

export const balanceSheetLines: NamlahBalanceSheetLine[] = [
  { id: 'bs_001', accountGroup: 'Assets / Kas Koloni', debit: 'Rp5.400.000', credit: 'Rp0', balance: 'Rp5.400.000', period: '2026-06', koloniCode: 'koloni_kejaksan_demo' },
  { id: 'bs_002', accountGroup: 'Assets / Piutang UMKM', debit: 'Rp1.275.000', credit: 'Rp0', balance: 'Rp1.275.000', period: '2026-06', koloniCode: 'koloni_kejaksan_demo' },
  { id: 'bs_003', accountGroup: 'Liabilities / Dana Program', debit: 'Rp0', credit: 'Rp2.100.000', balance: '-Rp2.100.000', period: '2026-06', koloniCode: 'koloni_kedawung_demo' },
  { id: 'bs_004', accountGroup: 'Equity / SHU Simulasi', debit: 'Rp0', credit: 'Rp3.800.000', balance: '-Rp3.800.000', period: '2026-06', koloniCode: 'koloni_harjamukti_demo' },
];

export const auditTrail: NamlahAuditEvent[] = [
  {
    id: 'audit_001',
    actorSemutId: 'SMT-UMKM-BUSITI',
    roleCode: 'umkm',
    actionType: 'umkm.onboard',
    targetModel: 'project.task',
    targetExternalId: 'namlah_task.onboarding_umkm_bu_siti',
    sourceApp: 'namlah-umkm',
    summary: 'Task onboarding dibuat dari template UMKM Onboarding Basic.',
    timestamp: '2026-06-19T10:00:00+07:00',
  },
  {
    id: 'audit_002',
    actorSemutId: 'SMT-SURVEYOR-007',
    roleCode: 'surveyor',
    actionType: 'task.proof.submit',
    targetModel: 'project.task.proof',
    targetExternalId: 'namlah_proof.foto_toko_bu_siti',
    sourceApp: 'namlah-surveyor',
    summary: 'Foto toko dan lokasi dikirim untuk validasi admin koloni.',
    timestamp: '2026-06-19T10:12:00+07:00',
  },
  {
    id: 'audit_003',
    actorSemutId: 'SMT-DONATUR-001',
    roleCode: 'member',
    actionType: 'donation.template.select',
    targetModel: 'project.project',
    targetExternalId: 'namlah_project.program_donasi_paket_foto_produk',
    sourceApp: 'namlah-superapp',
    summary: 'Donatur memilih template Program Donasi / Eksekusi Rencana.',
    timestamp: '2026-06-19T10:24:00+07:00',
  },
];

export function filterTasksForRole(tasks: NamlahControlTask[], roleId?: RoleId) {
  if (!roleId || roleId === 'admin' || roleId === 'koperasi') return tasks;
  return tasks.filter((task) => task.roleCode === roleId || task.stageCode.includes(roleId));
}

function filterByKoloniScope<T extends { koloniCode: string }>(rows: T[], koloniCode?: string) {
  const scope = getKoloniScope(koloniCode);
  return rows.filter((row) => scope.scopeKoloniCodes.includes(row.koloniCode));
}

function countByStage(tasks: NamlahControlTask[]) {
  return controlStages
    .map((stage) => ({ stageCode: stage.code, label: stage.label, count: tasks.filter((task) => task.stageCode === stage.code).length }))
    .filter((item) => item.count > 0);
}

function countByRole(tasks: NamlahControlTask[]) {
  return Object.values(roleConfigs)
    .map((role) => ({ roleCode: role.id, label: role.label, count: tasks.filter((task) => task.roleCode === role.id).length }))
    .filter((item) => item.count > 0);
}

function templateCounters(tasks: NamlahControlTask[]) {
  return planTemplates
    .map((template) => ({ code: template.code, title: template.title, activeCount: tasks.filter((task) => task.templateCode === template.code).length }))
    .filter((item) => item.activeCount > 0)
    .sort((a, b) => b.activeCount - a.activeCount);
}

function buildMetrics(tasks: NamlahControlTask[]): NamlahDashboardMetric[] {
  const validationCount = tasks.filter((task) => task.needsValidation).length;
  const lateCount = tasks.filter((task) => task.isLate).length;
  const activeTemplateCount = new Set(tasks.map((task) => task.templateCode)).size;
  return [
    { label: 'Task aktif', value: String(tasks.length), detail: 'project.task Ratu Semut' },
    { label: 'Butuh validasi', value: String(validationCount), detail: 'proof submitted atau stage validasi' },
    { label: 'Terlambat', value: String(lateCount), detail: 'perlu eskalasi Ratu Semut' },
    { label: 'Template aktif', value: String(activeTemplateCount), detail: 'rencana yang sedang dieksekusi' },
  ];
}

export function buildKoloniDashboard(roleId?: RoleId, koloniCode = defaultKoloniCode, activeView: NamlahRatuView = 'kanban'): NamlahKoloniDashboard {
  const scope = getKoloniScope(koloniCode);
  const tasks = filterTasksForRole(filterByKoloniScope(controlTasks, koloniCode), roleId);
  return {
    koloniCode: scope.node.code,
    wilayahCode: scope.node.wilayahCode || defaultWilayahCode,
    generatedAt: '2026-06-19T10:30:00+07:00',
    activeView,
    metrics: buildMetrics(tasks),
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
    salesOrders: filterByKoloniScope(salesOrders, koloniCode),
    milestones: filterByKoloniScope(milestones, koloniCode),
    balanceSheetLines: filterByKoloniScope(balanceSheetLines, koloniCode),
    auditTrail: auditTrail.filter((event) => !roleId || roleId === 'admin' || roleId === 'koperasi' || event.roleCode === roleId),
  };
}

export function getTemplate(code: string) {
  return planTemplates.find((template) => template.code === code) || planTemplates[0];
}

export function getTask(taskId: string) {
  return controlTasks.find((task) => task.id === taskId) || controlTasks[0];
}

function envelope(params: {
  actorSemutId: string;
  roleCode: RoleId;
  sourceApp: string;
  targetModel: NamlahOdooEnvelope['targetModel'];
  fields: NamlahOdooEnvelope['fields'];
}): NamlahOdooEnvelope {
  return {
    serviceUser: odooServiceUser,
    targetModel: params.targetModel,
    sourceApp: params.sourceApp,
    actorSemutId: params.actorSemutId,
    roleCode: params.roleCode,
    koloniCode: defaultKoloniCode,
    wilayahCode: defaultWilayahCode,
    fields: {
      x_namlah_semut_id: params.actorSemutId,
      x_namlah_role_code: params.roleCode,
      x_namlah_koloni_code: defaultKoloniCode,
      x_namlah_wilayah_code: defaultWilayahCode,
      x_namlah_source_app: params.sourceApp,
      x_namlah_tenant_code: tenantCode,
      x_namlah_sarang_code: sarangCode,
      ...params.fields,
    },
  };
}

export function buildSemutRegistration(input: Partial<SemutAccount>) {
  const semutId = input.semutId || 'SMT-DEMO-NEW';
  return {
    ok: true,
    actor: {
      semutId,
      displayName: input.displayName || 'Semut Baru',
      defaultRole: 'member' satisfies RoleId,
      koloniCode: defaultKoloniCode,
      wilayahCode: defaultWilayahCode,
    },
    odoo: envelope({
      actorSemutId: semutId,
      roleCode: 'member',
      sourceApp: 'namlah-superapp',
      targetModel: 'res.partner',
      fields: {
        name: input.displayName || 'Semut Baru',
        ref: semutId,
      },
    }),
  };
}

export function buildRoleApplication(input: { semutId?: string; roleCode?: RoleId; sourceApp?: string }) {
  const roleCode = input.roleCode || 'umkm';
  return {
    ok: true,
    roleApplication: {
      semutId: input.semutId || 'SMT-DEMO-ROLE',
      roleCode,
      status: roleCode === 'admin' ? 'needs_admin_approval' : 'submitted',
      koloniCode: defaultKoloniCode,
      wilayahCode: defaultWilayahCode,
    },
    odoo: envelope({
      actorSemutId: input.semutId || 'SMT-DEMO-ROLE',
      roleCode,
      sourceApp: input.sourceApp || 'namlah-superapp',
      targetModel: 'project.task',
      fields: {
        name: `Role-ID application: ${roleConfigs[roleCode].label}`,
        x_namlah_mobile_status: 'submitted',
        x_namlah_proof_status: 'required',
        x_namlah_template_code: 'umkm_onboarding_basic',
        x_namlah_plan_code: `role_application.${input.semutId || 'SMT-DEMO-ROLE'}.${roleCode}`,
      },
    }),
  };
}

export function buildUmkmOnboarding(input: { semutId?: string; businessName?: string; ownerName?: string }) {
  const template = getTemplate('umkm_onboarding_basic');
  const semutId = input.semutId || 'SMT-UMKM-NEW';
  const tasks = flattenBlueprint(template, semutId, semutId.toLowerCase().replace(/[^a-z0-9]+/g, '_'), `Onboarding UMKM ${input.businessName || input.ownerName || semutId}`);
  return {
    ok: true,
    template,
    tasks,
    dashboard: buildKoloniDashboard('umkm'),
    odoo: envelope({
      actorSemutId: semutId,
      roleCode: 'umkm',
      sourceApp: 'namlah-umkm',
      targetModel: 'project.task',
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

export function buildProjectFromTemplate(input: { semutId?: string; roleCode?: RoleId; templateCode?: NamlahProjectTemplateCode; planName?: string }) {
  const template = getTemplate(input.templateCode || 'donation_execution_plan');
  const roleCode = input.roleCode || template.roleScope[0] || 'admin';
  const semutId = input.semutId || 'SMT-PLAN-NEW';
  const seed = `${template.code}_${semutId}`.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const tasks = flattenBlueprint(template, semutId, seed, input.planName);
  return {
    ok: true,
    template,
    project: {
      name: input.planName || template.projectName,
      templateCode: template.code,
      taskCount: tasks.length,
      koloniCode: defaultKoloniCode,
      wilayahCode: defaultWilayahCode,
    },
    tasks,
    odoo: envelope({
      actorSemutId: semutId,
      roleCode,
      sourceApp: template.sourceApp,
      targetModel: 'project.project',
      fields: {
        name: input.planName || template.projectName,
        x_namlah_template_code: template.code,
        x_namlah_plan_code: `${template.code}.${seed}`,
      },
    }),
  };
}

export function buildTaskStatusUpdate(taskId: string, input: { semutId?: string; roleCode?: RoleId; stageCode?: string; mobileStatus?: NamlahMobileStatus }) {
  const task = getTask(taskId);
  const stage = stageByCode(input.stageCode || task.stageCode);
  const roleCode = input.roleCode || task.roleCode;
  return {
    ok: true,
    task: {
      ...task,
      stageCode: stage.code,
      stageLabel: stage.label,
      mobileStatus: input.mobileStatus || 'synced',
    },
    odoo: envelope({
      actorSemutId: input.semutId || task.semutId,
      roleCode,
      sourceApp: task.sourceApp,
      targetModel: 'project.task',
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

export function buildTaskProof(taskId: string, input: { semutId?: string; roleCode?: RoleId; proofStatus?: NamlahTaskProofStatus; note?: string }) {
  const task = getTask(taskId);
  const roleCode = input.roleCode || task.roleCode;
  return {
    ok: true,
    proof: {
      taskId: task.id,
      status: input.proofStatus || 'submitted',
      note: input.note || `Proof submitted for ${task.title}`,
      requiredProof: stageByCode(task.stageCode).requiredProof,
    },
    odoo: envelope({
      actorSemutId: input.semutId || task.semutId,
      roleCode,
      sourceApp: task.sourceApp,
      targetModel: 'project.task.proof',
      fields: {
        project_task_external_id: `namlah_task.${task.id}`,
        x_namlah_proof_status: input.proofStatus || 'submitted',
        note: input.note || null,
      },
    }),
  };
}

export function stagesForFlow(flow: NamlahKanbanFlow) {
  return flowStages(flow);
}
