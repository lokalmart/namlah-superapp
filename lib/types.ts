export type RoleId = 'member' | 'surveyor' | 'kurir' | 'kasir' | 'umkm' | 'admin' | 'koperasi';

export type AppTab = 'map' | 'store' | 'ratu' | 'scan' | 'account';

export type ExperienceTheme = 'modern' | 'game';

export type PortalEmailVerificationStatus = 'not_required' | 'unverified' | 'verified';

export type RoleAssignmentStatus = 'pending' | 'active' | 'blocked';

export type RoleAssignment = {
  roleId: RoleId;
  rolePinHashDemo: string;
  status: RoleAssignmentStatus;
  koloniCode: string;
  wilayahCode: string;
  registeredAt: string;
};

export type SemutAccount = {
  semutId: string;
  displayName: string;
  pinHashDemo: string;
  portalLogin?: string;
  portalStatus?: 'portal_ready';
  emailVerificationStatus?: PortalEmailVerificationStatus;
  roleAssignments: RoleAssignment[];
  activeRoleId: RoleId;
  experienceTheme: ExperienceTheme;
};

export type RoleConfig = {
  id: RoleId;
  label: string;
  theme: string;
  homeMode: string;
  headline: string;
  summary: string;
  featuredActions: string[];
  dashboardLabel: string;
  primaryModule: string;
  quickStats: Array<{ label: string; value: string }>;
  homeCards: Array<{ title: string; value: string; description: string }>;
  menuItems: Array<{ label: string; description: string }>;
  storeMode: string;
  scanMode: string;
};

export type NestPin = {
  id: string;
  type: 'nest' | 'store' | 'route' | 'survey' | 'stock' | 'finance';
  label: string;
  x: number;
  y: number;
  status: 'calm' | 'active' | 'urgent';
  activityCount: number;
  roles: RoleId[];
};

export type AntActivity = {
  id: string;
  roleId: RoleId;
  pinId: string;
  title: string;
  time: string;
  severity: 'info' | 'good' | 'warn';
};

export type StoreItem = {
  id: string;
  listingCode: string;
  title: string;
  category: string;
  koloniCode: string;
  ownerLabel: string;
  visibility: 'private' | 'parent_scope' | 'public_catalog';
  price: string;
  stock: string;
};

export type OdooSourceModel = 'project.task' | 'sale.order';

export type OdooCustomField = {
  model: 'project.project' | 'project.task' | 'project.milestone' | 'sale.order' | 'account.move' | 'account.move.line' | 'project.task.type';
  name: string;
  label: string;
  fieldType: 'char' | 'many2one' | 'selection' | 'text' | 'json' | 'boolean';
  relation?: string;
  purpose: string;
};

export type StageSopGuide = {
  stage: string;
  sopArticleExternalId: string;
  stepCode: string;
  requiredProof: string;
  checklist: string[];
  mobileHint: string;
  nextActionLabel: string;
  warningText?: string;
};

export type SourceOfTruthRecord = {
  id: string;
  roleId: RoleId;
  model: OdooSourceModel;
  title: string;
  project: string;
  stage: string;
  task?: string;
  saleOrder?: string;
  linkedRecord: string;
  fields: Array<{ label: string; value: string }>;
  sop: StageSopGuide;
};

export type PortalActor = {
  semutId: string;
  partnerExternalId: string;
  userExternalId?: string;
  portalLogin: string;
  portalStatus: 'partner_only' | 'portal_ready';
  emailRequired: boolean;
  emailVerificationStatus: PortalEmailVerificationStatus;
  koloniCode: string;
  wilayahCode: string;
};

export type NamlahKanbanFlow = 'umkm_onboarding' | 'umkm_promotion' | 'donation_program';

export type NamlahProjectTemplateCode =
  | 'umkm_onboarding_basic'
  | 'umkm_promotion_sprint'
  | 'survey_lokasi'
  | 'setup_kasir'
  | 'kurir_delivery'
  | 'donation_execution_plan';

export type NamlahTaskProofStatus = 'none' | 'required' | 'submitted' | 'approved' | 'rejected';

export type NamlahMobileStatus = 'draft' | 'submitted' | 'synced' | 'blocked';

export type NamlahControlStage = {
  code: string;
  label: string;
  flow: NamlahKanbanFlow;
  sequence: number;
  fold?: boolean;
  requiredProof: string;
  mobileHint: string;
  allowedRoles: RoleId[];
};

export type NamlahTaskBlueprint = {
  code: string;
  title: string;
  roleCode: RoleId;
  stageCode: string;
  description: string;
  proof: string;
  children?: NamlahTaskBlueprint[];
};

export type NamlahPlanTemplate = {
  code: NamlahProjectTemplateCode;
  title: string;
  category: string;
  sourceApp: string;
  roleScope: RoleId[];
  projectName: string;
  description: string;
  defaultFlow: NamlahKanbanFlow;
  impactMetric: string;
  tasks: NamlahTaskBlueprint[];
};

export type NamlahControlTask = {
  id: string;
  title: string;
  project: string;
  parentId?: string;
  stageCode: string;
  stageLabel: string;
  roleCode: RoleId;
  semutId: string;
  koloniCode: string;
  wilayahCode: string;
  sourceApp: string;
  templateCode: NamlahProjectTemplateCode;
  planCode: string;
  proofStatus: NamlahTaskProofStatus;
  mobileStatus: NamlahMobileStatus;
  deadline: string;
  priority: '0' | '1';
  childrenCount: number;
  needsValidation: boolean;
  isLate: boolean;
};

export type NamlahDashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type NamlahTemplateCounter = {
  code: NamlahProjectTemplateCode;
  title: string;
  activeCount: number;
};

export type NamlahRatuView = 'kanban' | 'sales_orders' | 'milestones' | 'balance_sheet';

export type NamlahSalesOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  sourceApp: string;
  amount: string;
  status: string;
  linkedTask: string;
  date: string;
  koloniCode: string;
};

export type NamlahMilestoneRow = {
  id: string;
  milestone: string;
  project: string;
  deadline: string;
  reached: boolean;
  progress: string;
  koloniCode: string;
};

export type NamlahBalanceSheetLine = {
  id: string;
  accountGroup: string;
  debit: string;
  credit: string;
  balance: string;
  period: string;
  koloniCode: string;
};

export type NamlahAuditEvent = {
  id: string;
  actorSemutId: string;
  roleCode: RoleId;
  actionType: string;
  targetModel: 'project.project' | 'project.task' | 'project.task.proof' | 'res.partner';
  targetExternalId: string;
  sourceApp: string;
  summary: string;
  timestamp: string;
};

export type NamlahKoloniDashboard = {
  koloniCode: string;
  wilayahCode: string;
  generatedAt: string;
  activeView: NamlahRatuView;
  metrics: NamlahDashboardMetric[];
  stages: NamlahControlStage[];
  templates: NamlahPlanTemplate[];
  taskByStage: Array<{ stageCode: string; label: string; count: number }>;
  taskByRole: Array<{ roleCode: RoleId; label: string; count: number }>;
  topTemplates: NamlahTemplateCounter[];
  activeUmkm: number;
  donationPrograms: number;
  lateTasks: NamlahControlTask[];
  validationTasks: NamlahControlTask[];
  tasks: NamlahControlTask[];
  salesOrders: NamlahSalesOrder[];
  milestones: NamlahMilestoneRow[];
  balanceSheetLines: NamlahBalanceSheetLine[];
  auditTrail: NamlahAuditEvent[];
};

export type NamlahOdooEnvelope = {
  serviceUser: string;
  targetModel: 'project.project' | 'project.task' | 'project.task.proof' | 'res.partner' | 'ir.attachment';
  sourceApp: string;
  actorSemutId: string;
  roleCode: RoleId;
  koloniCode: string;
  wilayahCode: string;
  fields: Record<string, string | number | boolean | null>;
};
