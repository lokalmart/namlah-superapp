export type RoleId = 'member' | 'surveyor' | 'kurir' | 'kasir' | 'umkm' | 'admin' | 'koperasi';

export type AppTab = 'map' | 'store' | 'scan' | 'account';

export type SemutAccount = {
  semutId: string;
  displayName: string;
  pinHashDemo: string;
  roles: RoleId[];
  activeRoleId: RoleId;
};

export type RoleConfig = {
  id: RoleId;
  label: string;
  theme: string;
  homeMode: string;
  headline: string;
  summary: string;
  featuredActions: string[];
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
  title: string;
  category: string;
  price: string;
  stock: string;
};
