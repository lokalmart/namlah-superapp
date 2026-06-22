import { makePortalIdentity } from '../portalIdentity';
import { createOdooBridgeClient, createOdooBridgeClientWithCredentials, type OdooBridgeClient, type OdooFieldMap } from './client';

export type PartnerLocationPin = {
  id: string;
  odooId: number;
  name: string;
  ref: string;
  latitude: number;
  longitude: number;
  partnerKind: string;
  roleCode: string;
  semutId: string;
  koloniCode: string;
  isCompany: boolean;
  updatedAt: string;
};

type PartnerRow = {
  id: number;
  name?: string;
  ref?: string | false;
  is_company?: boolean;
  company_type?: string | false;
  parent_id?: unknown;
  write_date?: string;
  partner_latitude?: number | false;
  partner_longitude?: number | false;
  x_namlah_latitude?: number | false;
  x_namlah_longitude?: number | false;
  x_namlah_lokasi_gps?: string | false;
  x_namlah_partner_kind?: string | false;
  x_namlah_semut_id?: string | false;
  x_namlah_role_code?: string | false;
  x_namlah_koloni_code?: string | false;
  x_namlah_location_updated_at?: string | false;
};

type FieldSpec = {
  name: string;
  label: string;
  ttype: 'char' | 'float' | 'boolean' | 'datetime';
};

const partnerLocationFields: FieldSpec[] = [
  { name: 'x_namlah_latitude', label: 'Namlah Latitude', ttype: 'float' },
  { name: 'x_namlah_longitude', label: 'Namlah Longitude', ttype: 'float' },
  { name: 'x_namlah_lokasi_gps', label: 'Namlah Lokasi GPS', ttype: 'char' },
  { name: 'x_namlah_partner_kind', label: 'Namlah Partner Kind', ttype: 'char' },
  { name: 'x_namlah_semut_id', label: 'Namlah Semut-ID', ttype: 'char' },
  { name: 'x_namlah_role_code', label: 'Namlah Role Code', ttype: 'char' },
  { name: 'x_namlah_koloni_code', label: 'Namlah Koloni Code', ttype: 'char' },
  { name: 'x_namlah_location_source', label: 'Namlah Location Source', ttype: 'char' },
  { name: 'x_namlah_location_updated_at', label: 'Namlah Location Updated At', ttype: 'datetime' },
  { name: 'x_namlah_is_koloni', label: 'Namlah Is Koloni', ttype: 'boolean' },
];

function numberValue(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(String(value || '').replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function text(value: unknown, fallback = '') {
  if (value === false || value === null || value === undefined) return fallback;
  return String(value);
}

function relationId(value: unknown) {
  if (Array.isArray(value) && typeof value[0] === 'number') return value[0];
  if (typeof value === 'number') return value;
  return undefined;
}

async function getModelId(client: OdooBridgeClient, model: string) {
  const rows = await client.searchRead<{ id: number }>('ir.model', [['model', '=', model]], ['id'], { limit: 1 });
  const id = rows[0]?.id;
  if (!id) throw new Error(`Model ${model} tidak ditemukan di ir.model.`);
  return id;
}

async function ensureField(client: OdooBridgeClient, modelId: number, fields: OdooFieldMap, spec: FieldSpec) {
  if (fields[spec.name]) return false;
  await client.create('ir.model.fields', {
    model_id: modelId,
    name: spec.name,
    field_description: spec.label,
    ttype: spec.ttype,
  });
  return true;
}

export async function ensurePartnerLocationFields(client: OdooBridgeClient) {
  let fields = await client.fieldsGet('res.partner');
  const modelId = await getModelId(client, 'res.partner');
  let created = 0;

  for (const spec of partnerLocationFields) {
    if (await ensureField(client, modelId, fields, spec)) created += 1;
  }

  if (created) fields = await client.fieldsGet('res.partner');
  return { fields, created };
}

function locationFieldPair(fields: OdooFieldMap) {
  const latitude = fields.partner_latitude ? 'partner_latitude' : 'x_namlah_latitude';
  const longitude = fields.partner_longitude ? 'partner_longitude' : 'x_namlah_longitude';
  return { latitude, longitude };
}

function parseGpsPair(value: unknown) {
  const raw = text(value);
  const match = raw.match(/(-?\d+(?:\.\d+)?)\s*[,;/ ]\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return {};
  return {
    latitude: numberValue(match[1]),
    longitude: numberValue(match[2]),
  };
}

function partnerKind(row: PartnerRow) {
  if (row.is_company || row.company_type === 'company') return 'koloni';
  return text(row.x_namlah_partner_kind, text(row.x_namlah_role_code, 'semut'));
}

function toPin(row: PartnerRow, fields: OdooFieldMap): PartnerLocationPin | null {
  const pair = locationFieldPair(fields);
  const gps = parseGpsPair(row.x_namlah_lokasi_gps);
  const latitude = numberValue(row[pair.latitude as keyof PartnerRow]) ?? gps.latitude;
  const longitude = numberValue(row[pair.longitude as keyof PartnerRow]) ?? gps.longitude;
  if (latitude === undefined || longitude === undefined) return null;

  return {
    id: `partner_${row.id}`,
    odooId: row.id,
    name: text(row.name, `Partner ${row.id}`),
    ref: text(row.ref),
    latitude,
    longitude,
    partnerKind: partnerKind(row),
    roleCode: text(row.x_namlah_role_code, row.is_company ? 'koloni' : 'semut'),
    semutId: text(row.x_namlah_semut_id, text(row.ref)),
    koloniCode: text(row.x_namlah_koloni_code, row.is_company ? text(row.ref) : ''),
    isCompany: Boolean(row.is_company || row.company_type === 'company'),
    updatedAt: text(row.x_namlah_location_updated_at, text(row.write_date)),
  };
}

export async function listPartnerLocationPins(koloniCode?: string): Promise<{ ok: true; source: 'odoo_live'; createdFields: number; pins: PartnerLocationPin[] }> {
  const client = await createOdooBridgeClient();
  const { fields, created } = await ensurePartnerLocationFields(client);
  const pair = locationFieldPair(fields);
  const readFields = [
    'id',
    'name',
    'ref',
    'is_company',
    'company_type',
    'parent_id',
    'write_date',
    pair.latitude,
    pair.longitude,
    'x_namlah_lokasi_gps',
    'x_namlah_partner_kind',
    'x_namlah_semut_id',
    'x_namlah_role_code',
    'x_namlah_koloni_code',
    'x_namlah_location_updated_at',
  ].filter((field) => Boolean(fields[field]));
  const domain: unknown[] = fields[pair.latitude] && fields[pair.longitude]
    ? [[pair.latitude, '!=', false], [pair.longitude, '!=', false]]
    : [];
  const rows = await client.searchRead<PartnerRow>('res.partner', domain, readFields, {
    limit: 120,
    order: fields.write_date ? 'write_date desc' : undefined,
  });
  const pins = rows
    .map((row) => toPin(row, fields))
    .filter((pin): pin is PartnerLocationPin => Boolean(pin))
    .filter((pin) => !koloniCode || pin.koloniCode === koloniCode || pin.isCompany);

  return {
    ok: true,
    source: 'odoo_live',
    createdFields: created,
    pins,
  };
}

export async function updatePartnerLocation(input: {
  semutId: string;
  portalLogin?: string;
  pin: string;
  latitude: number;
  longitude: number;
  roleCode: string;
  koloniCode: string;
  label?: string;
  source?: string;
}) {
  const semutId = input.semutId.trim();
  const portalLogin = (input.portalLogin || makePortalIdentity(semutId).portalLogin).trim();
  if (!semutId || input.pin.trim().length < 4) throw new Error('semutId dan PIN portal wajib diisi.');
  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) throw new Error('Latitude dan longitude wajib valid.');

  const portalClient = await createOdooBridgeClientWithCredentials(portalLogin, input.pin.trim());
  const users = await portalClient.searchRead<{ id: number; partner_id?: unknown }>(
    'res.users',
    [['login', '=', portalLogin]],
    ['id', 'partner_id'],
    { limit: 1 },
  ).catch(() => []);
  const portalPartnerId = relationId(users[0]?.partner_id);

  const client = await createOdooBridgeClient();
  const { fields, created } = await ensurePartnerLocationFields(client);
  const pair = locationFieldPair(fields);
  const identity = makePortalIdentity(semutId);
  const external = await client.resolveExternalId(identity.partnerExternalId);
  const partnerId = portalPartnerId || external?.res_id;
  if (!partnerId) throw new Error(`Partner portal untuk ${semutId} tidak ditemukan di Odoo.`);

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const values: Record<string, unknown> = {};
  values[pair.latitude] = input.latitude;
  values[pair.longitude] = input.longitude;
  if (fields.x_namlah_lokasi_gps) values.x_namlah_lokasi_gps = `${input.latitude},${input.longitude}`;
  if (fields.x_namlah_partner_kind) values.x_namlah_partner_kind = input.roleCode === 'kurir' ? 'kurir' : 'semut';
  if (fields.x_namlah_semut_id) values.x_namlah_semut_id = semutId;
  if (fields.x_namlah_role_code) values.x_namlah_role_code = input.roleCode;
  if (fields.x_namlah_koloni_code) values.x_namlah_koloni_code = input.koloniCode;
  if (fields.x_namlah_location_source) values.x_namlah_location_source = input.source || 'namlah-superapp';
  if (fields.x_namlah_location_updated_at) values.x_namlah_location_updated_at = now;
  if (input.label && fields.comment) values.comment = input.label;

  await client.write('res.partner', [partnerId], values);
  await client.ensureExternalId(identity.partnerExternalId, 'res.partner', partnerId);

  return {
    ok: true,
    source: 'odoo_live',
    createdFields: created,
    partner: {
      id: `partner_${partnerId}`,
      odooId: partnerId,
      semutId,
      portalLogin,
      latitude: input.latitude,
      longitude: input.longitude,
      roleCode: input.roleCode,
      koloniCode: input.koloniCode,
      updatedAt: now,
    },
  };
}
