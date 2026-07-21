import { makePortalIdentity } from '../portalIdentity';
import { createOdooBridgeClient, createOdooBridgeClientWithCredentials, type OdooBridgeClient, type OdooFieldMap } from './client';
import { createPortalClientFromSession } from './session';

export type NamlahForumPost = {
  id: string;
  odooId: number;
  title: string;
  body: string;
  author: string;
  forum: string;
  createdAt: string;
  koloniCode: string;
};

type ForumPostRow = {
  id: number;
  name?: string;
  content?: string;
  forum_id?: unknown;
  create_uid?: unknown;
  create_date?: string;
};

function relationName(value: unknown) {
  if (Array.isArray(value)) return String(value[1] ?? value[0] ?? '');
  if (value === false || value === null || value === undefined) return '';
  return String(value);
}

function stripHtml(value: unknown) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function getFields(client: OdooBridgeClient, model: string): Promise<OdooFieldMap> {
  try {
    return await client.fieldsGet(model);
  } catch {
    throw new Error('Odoo Forum belum tersedia. Install modul Website Forum agar Forum Namlah bisa membaca/menulis record Odoo.');
  }
}

function existingFieldNames(fields: OdooFieldMap, wanted: string[]) {
  return wanted.filter((field) => Boolean(fields[field]));
}

async function findOrCreateNamlahForum(client: OdooBridgeClient, koloniCode: string) {
  const fields = await getFields(client, 'forum.forum');
  const searchFields = existingFieldNames(fields, ['id', 'name']);
  const forums = await client.searchRead<{ id: number; name?: string }>(
    'forum.forum',
    [['name', 'ilike', 'Namlah']],
    searchFields.length ? searchFields : ['id'],
    { limit: 1 },
  );
  if (forums[0]?.id) return forums[0];

  const values: Record<string, unknown> = {};
  if (fields.name) values.name = `Namlah Forum ${koloniCode}`;
  if (!Object.keys(values).length) {
    throw new Error('Model forum.forum tidak punya field name yang bisa ditulis.');
  }

  const id = await client.create('forum.forum', values);
  return { id, name: String(values.name) };
}

export async function listForumPosts(koloniCode?: string): Promise<{ ok: true; posts: NamlahForumPost[] }> {
  const client = await createOdooBridgeClient();
  const fields = await getFields(client, 'forum.post');
  const readFields = existingFieldNames(fields, ['id', 'name', 'content', 'forum_id', 'create_uid', 'create_date']);
  const rows = await client.searchRead<ForumPostRow>('forum.post', [], readFields, {
    limit: 30,
    order: fields.create_date ? 'create_date desc' : undefined,
  });
  const filteredRows = koloniCode
    ? rows.filter((row) => `${row.name || ''} ${stripHtml(row.content)}`.toLowerCase().includes(koloniCode.toLowerCase()))
    : rows;

  return {
    ok: true,
    posts: filteredRows.map((row) => ({
      id: `forum_post_${row.id}`,
      odooId: row.id,
      title: row.name || `Forum Post ${row.id}`,
      body: stripHtml(row.content),
      author: relationName(row.create_uid) || 'Odoo User',
      forum: relationName(row.forum_id) || 'Odoo Forum',
      createdAt: row.create_date || '',
      koloniCode: koloniCode || '',
    })),
  };
}

export async function createForumPost(input: {
  semutId: string;
  portalLogin?: string;
  pin?: string;
  sessionToken?: string;
  koloniCode: string;
  title: string;
  body: string;
}) {
  const portal = makePortalIdentity(input.semutId);
  const portalLogin = (input.portalLogin || portal.portalLogin).trim();
  const integrationClient = await createOdooBridgeClient();
  const forum = await findOrCreateNamlahForum(integrationClient, input.koloniCode);
  
  let portalClient: OdooBridgeClient;
  if (input.sessionToken) {
    const sessionClient = await createPortalClientFromSession(input.sessionToken);
    if (!sessionClient) {
      throw new Error('Sesi portal Odoo tidak valid atau sudah kedaluwarsa. Silakan login kembali.');
    }
    portalClient = sessionClient;
  } else {
    const pin = input.pin?.trim() || '';
    if (!pin) throw new Error('PIN portal wajib diisi.');
    portalClient = await createOdooBridgeClientWithCredentials(portalLogin, pin);
  }
  
  const postFields = await getFields(portalClient, 'forum.post');

  const title = `[${input.koloniCode}] ${input.title.trim()}`;
  const body = `<p>${escapeHtml(input.body.trim()).replace(/\n/g, '<br/>')}</p>`;
  const values: Record<string, unknown> = {};
  if (postFields.name) values.name = title;
  if (postFields.content) values.content = body;
  if (postFields.forum_id) values.forum_id = forum.id;

  if (!values.name || !values.content || !values.forum_id) {
    throw new Error('Model forum.post tidak punya field wajib name/content/forum_id.');
  }

  const id = await portalClient.create('forum.post', values);
  return {
    ok: true,
    post: {
      id: `forum_post_${id}`,
      odooId: id,
      title,
      body: input.body.trim(),
      author: portalLogin,
      forum: forum.name || 'Namlah Forum',
      createdAt: new Date().toISOString(),
      koloniCode: input.koloniCode,
    } satisfies NamlahForumPost,
  };
}
