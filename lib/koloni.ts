export type KoloniLevel = 'koloni' | 'mega_koloni';

export type KoloniNode = {
  code: string;
  name: string;
  wilayahCode: string;
  level: KoloniLevel;
  parentKoloniCode?: string;
};

export const defaultKoloniCode = 'koloni_kejaksan_demo';
export const defaultWilayahCode = 'wilayah_kecamatan_kejaksan_demo';

export const koloniNodes: KoloniNode[] = [
  {
    code: 'mega_cirebon_demo',
    name: 'Mega Koloni Cirebon',
    wilayahCode: 'wilayah_kota_cirebon_demo',
    level: 'mega_koloni',
  },
  {
    code: 'koloni_kejaksan_demo',
    name: 'Koloni Kecamatan Kejaksan',
    wilayahCode: 'wilayah_kecamatan_kejaksan_demo',
    level: 'koloni',
    parentKoloniCode: 'mega_cirebon_demo',
  },
  {
    code: 'koloni_kedawung_demo',
    name: 'Koloni Kecamatan Kedawung',
    wilayahCode: 'wilayah_kecamatan_kedawung_demo',
    level: 'koloni',
    parentKoloniCode: 'mega_cirebon_demo',
  },
  {
    code: 'koloni_harjamukti_demo',
    name: 'Koloni Kecamatan Harjamukti',
    wilayahCode: 'wilayah_kecamatan_harjamukti_demo',
    level: 'koloni',
    parentKoloniCode: 'mega_cirebon_demo',
  },
];

export function getKoloniNode(code?: string) {
  return koloniNodes.find((node) => node.code === code) || koloniNodes.find((node) => node.code === defaultKoloniCode) || koloniNodes[0];
}

export function getKoloniScope(koloniCode?: string) {
  const node = getKoloniNode(koloniCode);
  if (node.level === 'mega_koloni') {
    const childCodes = koloniNodes.filter((candidate) => candidate.parentKoloniCode === node.code).map((candidate) => candidate.code);
    return {
      node,
      scopeKoloniCodes: [node.code, ...childCodes],
      label: `${node.name} / ${childCodes.length} koloni`,
    };
  }
  return {
    node,
    scopeKoloniCodes: [node.code],
    label: node.name,
  };
}
