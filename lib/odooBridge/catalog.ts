import { createOdooBridgeClient, type OdooBridgeClient, type OdooFieldMap } from './client';

export type NamlahCatalogProduct = {
  id: string;
  odooId: number;
  name: string;
  code: string;
  price: number;
  formattedPrice: string;
  category: string;
  uom: string;
  stock?: number;
  updatedAt: string;
};

type ProductRow = {
  id: number;
  name?: string;
  default_code?: string | false;
  list_price?: number;
  categ_id?: unknown;
  uom_id?: unknown;
  qty_available?: number;
  write_date?: string;
};

const seedProducts = [
  { name: 'Beras Organik Koloni', default_code: 'NAMLAH-BERAS-ORGANIK', list_price: 28000 },
  { name: 'Madu Hutan Koloni', default_code: 'NAMLAH-MADU-HUTAN', list_price: 85000 },
  { name: 'Kopi Arabika Sarang', default_code: 'NAMLAH-KOPI-ARABIKA', list_price: 78000 },
  { name: 'Keripik Pisang UMKM', default_code: 'NAMLAH-KERIPIK-PISANG', list_price: 18000 },
];

function relationName(value: unknown) {
  if (Array.isArray(value)) return String(value[1] ?? value[0] ?? '');
  if (value === false || value === null || value === undefined) return '';
  return String(value);
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

async function getProductFields(client: OdooBridgeClient): Promise<OdooFieldMap> {
  try {
    return await client.fieldsGet('product.product');
  } catch {
    throw new Error('Model product.product belum tersedia di Odoo. Install modul Sales/Inventory agar katalog Namlah bisa membaca produk real.');
  }
}

function existingFieldNames(fields: OdooFieldMap, wanted: string[]) {
  return wanted.filter((field) => Boolean(fields[field]));
}

function toCatalogProduct(row: ProductRow): NamlahCatalogProduct {
  const price = Number(row.list_price || 0);
  return {
    id: `product_${row.id}`,
    odooId: row.id,
    name: row.name || `Produk Odoo ${row.id}`,
    code: row.default_code ? String(row.default_code) : `ODOO-${row.id}`,
    price,
    formattedPrice: formatRupiah(price),
    category: relationName(row.categ_id) || 'Odoo Product',
    uom: relationName(row.uom_id) || 'Unit',
    stock: typeof row.qty_available === 'number' ? row.qty_available : undefined,
    updatedAt: row.write_date || '',
  };
}

function buildDomain(fields: OdooFieldMap) {
  const domain: unknown[] = [];
  if (fields.sale_ok) domain.push(['sale_ok', '=', true]);
  if (fields.active) domain.push(['active', '=', true]);
  return domain;
}

async function readProducts(client: OdooBridgeClient, fields: OdooFieldMap, limit: number) {
  const readFields = existingFieldNames(fields, ['id', 'name', 'default_code', 'list_price', 'categ_id', 'uom_id', 'qty_available', 'write_date']);
  return client.searchRead<ProductRow>('product.product', buildDomain(fields), readFields, {
    limit,
    order: fields.write_date ? 'write_date desc' : undefined,
  });
}

export async function listCatalogProducts(limit = 12): Promise<{ ok: true; source: 'odoo_live'; products: NamlahCatalogProduct[] }> {
  const client = await createOdooBridgeClient();
  const fields = await getProductFields(client);
  const rows = await readProducts(client, fields, limit);
  return {
    ok: true,
    source: 'odoo_live',
    products: rows.map(toCatalogProduct),
  };
}

export async function ensureCatalogProducts(): Promise<{ ok: true; source: 'odoo_live'; created: number; products: NamlahCatalogProduct[] }> {
  const client = await createOdooBridgeClient();
  const fields = await getProductFields(client);
  let created = 0;

  for (const seed of seedProducts) {
    const existing = await client.search('product.product', [['default_code', '=', seed.default_code]], { limit: 1 });
    if (existing.length) continue;

    const values: Record<string, unknown> = {};
    if (fields.name && !fields.name.readonly) values.name = seed.name;
    if (fields.default_code && !fields.default_code.readonly) values.default_code = seed.default_code;
    if (fields.list_price && !fields.list_price.readonly) values.list_price = seed.list_price;
    if (fields.sale_ok && !fields.sale_ok.readonly) values.sale_ok = true;
    if (fields.purchase_ok && !fields.purchase_ok.readonly) values.purchase_ok = false;

    await client.create('product.product', values);
    created += 1;
  }

  const rows = await readProducts(client, fields, 12);
  return {
    ok: true,
    source: 'odoo_live',
    created,
    products: rows.map(toCatalogProduct),
  };
}
