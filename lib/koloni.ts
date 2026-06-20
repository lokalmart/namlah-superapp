export type KoloniLevel = 'koloni' | 'mega_koloni';
export type KoloniStatus = 'active' | 'pending' | 'archived';
export type KoloniAccessMode = 'exclusive' | 'inclusive';
export type KoloniJoinPolicy = 'open' | 'approval_required' | 'invite_only';
export type KoloniVisibilityPolicy = 'private' | 'parent_scope' | 'public_catalog';
export type KoloniRelationStatus = 'requested' | 'approved' | 'rejected';

export type KoloniNode = {
  code: string;
  name: string;
  wilayahCode: string;
  geoAreaCode: string;
  geoAreaName: string;
  level: KoloniLevel;
  status: KoloniStatus;
  accessMode: KoloniAccessMode;
  joinPolicy: KoloniJoinPolicy;
  catalogVisibility: KoloniVisibilityPolicy;
  collaborationVisibility: KoloniVisibilityPolicy;
  primaryRatuSemutId: string;
  primaryRatuName: string;
  primaryRatuPhone: string;
  primaryRatuEmail: string;
  parentKoloniCode?: string;
  parentRelationStatus?: KoloniRelationStatus;
};

export const defaultKoloniCode = 'koloni_kejaksan';
export const defaultWilayahCode = 'wilayah_kecamatan_kejaksan';

export const koloniNodes: KoloniNode[] = [
  {
    code: 'mega_cirebon',
    name: 'Mega Koloni Cirebon',
    wilayahCode: 'wilayah_kota_cirebon',
    geoAreaCode: 'geo_kota_cirebon',
    geoAreaName: 'Kota Cirebon',
    level: 'mega_koloni',
    status: 'active',
    accessMode: 'inclusive',
    joinPolicy: 'approval_required',
    catalogVisibility: 'parent_scope',
    collaborationVisibility: 'parent_scope',
    primaryRatuSemutId: 'SMT-RATU-MEGA',
    primaryRatuName: 'Ratu Mega Cirebon',
    primaryRatuPhone: '+6281122001100',
    primaryRatuEmail: 'ratu.mega@namlah.id',
  },
  {
    code: 'koloni_kejaksan',
    name: 'Koloni Kecamatan Kejaksan',
    wilayahCode: 'wilayah_kecamatan_kejaksan',
    geoAreaCode: 'geo_kecamatan_kejaksan',
    geoAreaName: 'Kecamatan Kejaksan',
    level: 'koloni',
    status: 'active',
    accessMode: 'exclusive',
    joinPolicy: 'approval_required',
    catalogVisibility: 'parent_scope',
    collaborationVisibility: 'parent_scope',
    primaryRatuSemutId: 'SMT-RATU-KEJAKSAN',
    primaryRatuName: 'Ratu Koloni Kejaksan',
    primaryRatuPhone: '+6281122001101',
    primaryRatuEmail: 'ratu.kejaksan@namlah.id',
    parentKoloniCode: 'mega_cirebon',
    parentRelationStatus: 'approved',
  },
  {
    code: 'koloni_kedawung',
    name: 'Koloni Kecamatan Kedawung',
    wilayahCode: 'wilayah_kecamatan_kedawung',
    geoAreaCode: 'geo_kecamatan_kedawung',
    geoAreaName: 'Kecamatan Kedawung',
    level: 'koloni',
    status: 'active',
    accessMode: 'exclusive',
    joinPolicy: 'approval_required',
    catalogVisibility: 'parent_scope',
    collaborationVisibility: 'parent_scope',
    primaryRatuSemutId: 'SMT-RATU-KEDAWUNG',
    primaryRatuName: 'Ratu Koloni Kedawung',
    primaryRatuPhone: '+6281122001102',
    primaryRatuEmail: 'ratu.kedawung@namlah.id',
    parentKoloniCode: 'mega_cirebon',
    parentRelationStatus: 'approved',
  },
  {
    code: 'koloni_harjamukti',
    name: 'Koloni Kecamatan Harjamukti',
    wilayahCode: 'wilayah_kecamatan_harjamukti',
    geoAreaCode: 'geo_kecamatan_harjamukti',
    geoAreaName: 'Kecamatan Harjamukti',
    level: 'koloni',
    status: 'active',
    accessMode: 'exclusive',
    joinPolicy: 'approval_required',
    catalogVisibility: 'parent_scope',
    collaborationVisibility: 'parent_scope',
    primaryRatuSemutId: 'SMT-RATU-HARJAMUKTI',
    primaryRatuName: 'Ratu Koloni Harjamukti',
    primaryRatuPhone: '+6281122001103',
    primaryRatuEmail: 'ratu.harjamukti@namlah.id',
    parentKoloniCode: 'mega_cirebon',
    parentRelationStatus: 'approved',
  },
  {
    code: 'koloni_kejaksan_mandiri',
    name: 'Koloni Kejaksan Mandiri',
    wilayahCode: 'wilayah_kecamatan_kejaksan',
    geoAreaCode: 'geo_kecamatan_kejaksan',
    geoAreaName: 'Kecamatan Kejaksan',
    level: 'koloni',
    status: 'active',
    accessMode: 'exclusive',
    joinPolicy: 'open',
    catalogVisibility: 'private',
    collaborationVisibility: 'private',
    primaryRatuSemutId: 'SMT-RATU-MANDIRI',
    primaryRatuName: 'Ratu Koloni Mandiri',
    primaryRatuPhone: '+6281122001104',
    primaryRatuEmail: 'ratu.mandiri@namlah.id',
  },
];

function virtualKoloniNode(code: string): KoloniNode {
  return {
    code,
    name: `Koloni ${code}`,
    wilayahCode: defaultWilayahCode,
    geoAreaCode: defaultWilayahCode.replace(/^wilayah_/, 'geo_'),
    geoAreaName: 'Wilayah Odoo',
    level: 'koloni',
    status: 'active',
    accessMode: 'exclusive',
    joinPolicy: 'approval_required',
    catalogVisibility: 'private',
    collaborationVisibility: 'private',
    primaryRatuSemutId: '',
    primaryRatuName: 'Ratu Koloni',
    primaryRatuPhone: '',
    primaryRatuEmail: '',
  };
}

export function getKoloniNode(code?: string) {
  const cleanedCode = code?.trim();
  const known = koloniNodes.find((node) => node.code === cleanedCode);
  if (known) return known;
  if (cleanedCode) return virtualKoloniNode(cleanedCode);
  return koloniNodes.find((node) => node.code === defaultKoloniCode) || koloniNodes[0];
}

export function getJoinableKoloniNodes() {
  return koloniNodes.filter((node) => node.status === 'active' && node.joinPolicy !== 'invite_only');
}

export function getApprovedChildKoloniNodes(parentKoloniCode: string) {
  return koloniNodes.filter((node) => node.parentKoloniCode === parentKoloniCode && node.parentRelationStatus === 'approved');
}

export function canParentAccessChild(parent: KoloniNode, child: KoloniNode) {
  if (child.parentKoloniCode !== parent.code || child.parentRelationStatus !== 'approved') return false;
  return parent.accessMode === 'inclusive' || child.collaborationVisibility === 'parent_scope';
}

export function getKoloniScope(koloniCode?: string) {
  const node = getKoloniNode(koloniCode);
  if (node.level === 'mega_koloni' || node.accessMode === 'inclusive') {
    const childCodes = getApprovedChildKoloniNodes(node.code)
      .filter((child) => canParentAccessChild(node, child))
      .map((candidate) => candidate.code);
    return {
      node,
      scopeKoloniCodes: [node.code, ...childCodes],
      label: `${node.name} / ${childCodes.length} koloni`,
      childCount: childCodes.length,
    };
  }
  return {
    node,
    scopeKoloniCodes: [node.code],
    label: node.name,
    childCount: 0,
  };
}

export function describeKoloniPolicy(node: KoloniNode) {
  return {
    accessMode: node.accessMode,
    joinPolicy: node.joinPolicy,
    catalogVisibility: node.catalogVisibility,
    collaborationVisibility: node.collaborationVisibility,
    ownerRole: 'ratu_koloni',
    primaryRatuSemutId: node.primaryRatuSemutId,
    primaryRatuName: node.primaryRatuName,
    primaryRatuPhone: node.primaryRatuPhone,
    primaryRatuEmail: node.primaryRatuEmail,
  };
}
