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
  parentKoloniCode?: string;
  parentRelationStatus?: KoloniRelationStatus;
};

export const defaultKoloniCode = 'koloni_kejaksan_demo';
export const defaultWilayahCode = 'wilayah_kecamatan_kejaksan_demo';

export const koloniNodes: KoloniNode[] = [
  {
    code: 'mega_cirebon_demo',
    name: 'Mega Koloni Cirebon',
    wilayahCode: 'wilayah_kota_cirebon_demo',
    geoAreaCode: 'geo_kota_cirebon',
    geoAreaName: 'Kota Cirebon',
    level: 'mega_koloni',
    status: 'active',
    accessMode: 'inclusive',
    joinPolicy: 'approval_required',
    catalogVisibility: 'parent_scope',
    collaborationVisibility: 'parent_scope',
    primaryRatuSemutId: 'SMT-RATU-MEGA',
  },
  {
    code: 'koloni_kejaksan_demo',
    name: 'Koloni Kecamatan Kejaksan',
    wilayahCode: 'wilayah_kecamatan_kejaksan_demo',
    geoAreaCode: 'geo_kecamatan_kejaksan',
    geoAreaName: 'Kecamatan Kejaksan',
    level: 'koloni',
    status: 'active',
    accessMode: 'exclusive',
    joinPolicy: 'approval_required',
    catalogVisibility: 'parent_scope',
    collaborationVisibility: 'parent_scope',
    primaryRatuSemutId: 'SMT-RATU-KEJAKSAN',
    parentKoloniCode: 'mega_cirebon_demo',
    parentRelationStatus: 'approved',
  },
  {
    code: 'koloni_kedawung_demo',
    name: 'Koloni Kecamatan Kedawung',
    wilayahCode: 'wilayah_kecamatan_kedawung_demo',
    geoAreaCode: 'geo_kecamatan_kedawung',
    geoAreaName: 'Kecamatan Kedawung',
    level: 'koloni',
    status: 'active',
    accessMode: 'exclusive',
    joinPolicy: 'approval_required',
    catalogVisibility: 'parent_scope',
    collaborationVisibility: 'parent_scope',
    primaryRatuSemutId: 'SMT-RATU-KEDAWUNG',
    parentKoloniCode: 'mega_cirebon_demo',
    parentRelationStatus: 'approved',
  },
  {
    code: 'koloni_harjamukti_demo',
    name: 'Koloni Kecamatan Harjamukti',
    wilayahCode: 'wilayah_kecamatan_harjamukti_demo',
    geoAreaCode: 'geo_kecamatan_harjamukti',
    geoAreaName: 'Kecamatan Harjamukti',
    level: 'koloni',
    status: 'active',
    accessMode: 'exclusive',
    joinPolicy: 'approval_required',
    catalogVisibility: 'parent_scope',
    collaborationVisibility: 'parent_scope',
    primaryRatuSemutId: 'SMT-RATU-HARJAMUKTI',
    parentKoloniCode: 'mega_cirebon_demo',
    parentRelationStatus: 'approved',
  },
  {
    code: 'koloni_kejaksan_mandiri_demo',
    name: 'Koloni Kejaksan Mandiri',
    wilayahCode: 'wilayah_kecamatan_kejaksan_demo',
    geoAreaCode: 'geo_kecamatan_kejaksan',
    geoAreaName: 'Kecamatan Kejaksan',
    level: 'koloni',
    status: 'active',
    accessMode: 'exclusive',
    joinPolicy: 'open',
    catalogVisibility: 'private',
    collaborationVisibility: 'private',
    primaryRatuSemutId: 'SMT-RATU-MANDIRI',
  },
];

export function getKoloniNode(code?: string) {
  return koloniNodes.find((node) => node.code === code) || koloniNodes.find((node) => node.code === defaultKoloniCode) || koloniNodes[0];
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
  };
}
