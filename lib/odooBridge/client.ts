import * as xmlrpc from 'xmlrpc';
import { requireOdooBridgeConfig, safeErrorMessage, type OdooBridgeConfig } from './config';

export type OdooDomain = unknown[];

export type OdooSearchReadOptions = {
  limit?: number;
  offset?: number;
  order?: string;
};

export type OdooFieldMap = Record<string, {
  string?: string;
  type?: string;
  relation?: string;
  required?: boolean;
  readonly?: boolean;
  store?: boolean;
  selection?: unknown;
}>;

export type OdooBridgeClient = {
  config: OdooBridgeConfig;
  uid?: number;
  health(): Promise<Record<string, unknown>>;
  executeKw<T = unknown>(model: string, method: string, args?: unknown[], kwargs?: Record<string, unknown>): Promise<T>;
  fieldsGet(model: string): Promise<OdooFieldMap>;
  searchRead<T = Record<string, unknown>>(model: string, domain?: OdooDomain, fields?: string[], options?: OdooSearchReadOptions): Promise<T[]>;
  search(model: string, domain?: OdooDomain, options?: OdooSearchReadOptions): Promise<number[]>;
  searchCount(model: string, domain?: OdooDomain): Promise<number>;
  read<T = Record<string, unknown>>(model: string, ids: number[], fields?: string[]): Promise<T[]>;
  create(model: string, values: Record<string, unknown>): Promise<number>;
  write(model: string, ids: number[], values: Record<string, unknown>): Promise<boolean>;
  resolveExternalId(raw: string): Promise<{ model: string; res_id: number; module: string; name: string; complete_name: string } | null>;
  ensureExternalId(raw: string, model: string, resId: number): Promise<void>;
};

function makeXmlClient(url: string) {
  const parsed = new URL(url);
  const factory = parsed.protocol === 'https:' ? xmlrpc.createSecureClient : xmlrpc.createClient;
  return factory({ url, cookies: true });
}

function xmlCall(client: xmlrpc.XmlRpcClient, method: string, params: unknown[]): Promise<unknown> {
  return new Promise((resolve, reject) => {
    client.methodCall(method, params, (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
}

function splitXmlId(raw: string, defaultModule: string) {
  const cleaned = String(raw || '').trim();
  if (!cleaned) throw new Error('External ID kosong.');
  if (cleaned.includes('.')) {
    const [module, ...rest] = cleaned.split('.');
    const name = rest.join('.');
    return { module, name, complete_name: `${module}.${name}` };
  }
  const safeName = cleaned.replace(/[^a-zA-Z0-9_.]/g, '_');
  return { module: defaultModule, name: safeName, complete_name: `${defaultModule}.${safeName}` };
}

async function createXmlRpcClient(config: OdooBridgeConfig): Promise<OdooBridgeClient> {
  const common = makeXmlClient(`${config.url}/xmlrpc/2/common`);
  const object = makeXmlClient(`${config.url}/xmlrpc/2/object`);
  const uid = await xmlCall(common, 'authenticate', [config.db, config.username, config.password, {}]);

  if (!uid || typeof uid !== 'number') {
    throw new Error('Odoo authentication failed. Check ODOO_DB, ODOO_USERNAME, and ODOO_PASSWORD/API key.');
  }

  async function executeKw<T = unknown>(model: string, method: string, args: unknown[] = [], kwargs: Record<string, unknown> = {}): Promise<T> {
    const params = [config.db, uid, config.password, model, method, args, kwargs];
    return (await xmlCall(object, 'execute_kw', params)) as T;
  }

  const client = makeCommonClient(config, executeKw, uid);
  client.health = async () => {
    const version = await xmlCall(common, 'version', []).catch((error) => ({ error: safeErrorMessage(error) }));
    return { authenticated: true, uid, apiMode: config.apiMode, version };
  };
  return client;
}

async function json2Call<T>(config: OdooBridgeConfig, model: string, method: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${config.url}/json/2/${model}/${method}`, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${config.password}`,
      'Content-Type': 'application/json; charset=utf-8',
      'X-Odoo-Database': config.db,
      'User-Agent': 'namlah-superapp-odoo-bridge',
    },
    body: JSON.stringify({ context: { lang: 'en_US' }, ...body }),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'message' in payload ? String(payload.message) : response.statusText;
    throw new Error(`Odoo JSON-2 ${model}/${method} failed: ${message}`);
  }
  return payload as T;
}

async function createJson2Client(config: OdooBridgeConfig): Promise<OdooBridgeClient> {
  async function executeKw<T = unknown>(model: string, method: string, args: unknown[] = [], kwargs: Record<string, unknown> = {}): Promise<T> {
    if (method === 'fields_get') {
      return json2Call<T>(config, model, method, { attributes: kwargs.attributes || [] });
    }
    if (method === 'search_read') {
      return json2Call<T>(config, model, method, { domain: args[0] || [], ...kwargs });
    }
    if (method === 'search') {
      return json2Call<T>(config, model, method, { domain: args[0] || [], ...kwargs });
    }
    if (method === 'search_count') {
      return json2Call<T>(config, model, method, { domain: args[0] || [], ...kwargs });
    }
    if (method === 'read') {
      return json2Call<T>(config, model, method, { ids: args[0] || [], ...kwargs });
    }
    if (method === 'create') {
      return json2Call<T>(config, model, method, { vals_list: args[0], ...kwargs });
    }
    if (method === 'write') {
      return json2Call<T>(config, model, method, { ids: args[0] || [], values: args[1] || {}, ...kwargs });
    }
    if (method === 'message_post') {
      return json2Call<T>(config, model, method, { ids: args[0] || [], ...kwargs });
    }
    return json2Call<T>(config, model, method, { args, ...kwargs });
  }

  const client = makeCommonClient(config, executeKw);
  client.health = async () => {
    const context = await json2Call<Record<string, unknown>>(config, 'res.users', 'context_get', {});
    return { authenticated: true, apiMode: config.apiMode, context };
  };
  return client;
}

function makeCommonClient(config: OdooBridgeConfig, executeKw: OdooBridgeClient['executeKw'], uid?: number): OdooBridgeClient {
  async function fieldsGet(model: string): Promise<OdooFieldMap> {
    return executeKw<OdooFieldMap>(model, 'fields_get', [], { attributes: ['string', 'type', 'relation', 'required', 'readonly', 'store', 'selection'] });
  }

  async function searchRead<T = Record<string, unknown>>(model: string, domain: OdooDomain = [], fields: string[] = [], options: OdooSearchReadOptions = {}): Promise<T[]> {
    const kwargs: Record<string, unknown> = { limit: options.limit ?? 200, offset: options.offset ?? 0 };
    if (fields.length) kwargs.fields = fields;
    if (options.order) kwargs.order = options.order;
    return executeKw<T[]>(model, 'search_read', [domain], kwargs);
  }

  async function search(model: string, domain: OdooDomain = [], options: OdooSearchReadOptions = {}): Promise<number[]> {
    const kwargs: Record<string, unknown> = { limit: options.limit ?? 200, offset: options.offset ?? 0 };
    if (options.order) kwargs.order = options.order;
    return executeKw<number[]>(model, 'search', [domain], kwargs);
  }

  async function searchCount(model: string, domain: OdooDomain = []): Promise<number> {
    return executeKw<number>(model, 'search_count', [domain]);
  }

  async function read<T = Record<string, unknown>>(model: string, ids: number[], fields: string[] = []): Promise<T[]> {
    const kwargs: Record<string, unknown> = {};
    if (fields.length) kwargs.fields = fields;
    return executeKw<T[]>(model, 'read', [ids], kwargs);
  }

  async function create(model: string, values: Record<string, unknown>): Promise<number> {
    return executeKw<number>(model, 'create', [values]);
  }

  async function write(model: string, ids: number[], values: Record<string, unknown>): Promise<boolean> {
    return executeKw<boolean>(model, 'write', [ids, values]);
  }

  async function resolveExternalId(raw: string) {
    const xml = splitXmlId(raw, config.defaultModule);
    const found = await searchRead<{ model: string; res_id: number; module: string; name: string }>(
      'ir.model.data',
      [['module', '=', xml.module], ['name', '=', xml.name]],
      ['module', 'name', 'model', 'res_id'],
      { limit: 1 },
    );
    if (!found.length) return null;
    return { ...found[0], complete_name: xml.complete_name };
  }

  async function ensureExternalId(raw: string, model: string, resId: number): Promise<void> {
    const xml = splitXmlId(raw, config.defaultModule);
    const existing = await searchRead<{ id: number }>(
      'ir.model.data',
      [['module', '=', xml.module], ['name', '=', xml.name]],
      ['id'],
      { limit: 1 },
    );
    if (existing.length) {
      await write('ir.model.data', [existing[0].id], { model, res_id: resId, noupdate: true });
      return;
    }
    await create('ir.model.data', {
      module: xml.module,
      name: xml.name,
      model,
      res_id: resId,
      noupdate: true,
    });
  }

  return {
    config,
    uid,
    health: async () => ({ authenticated: true, apiMode: config.apiMode }),
    executeKw,
    fieldsGet,
    searchRead,
    search,
    searchCount,
    read,
    create,
    write,
    resolveExternalId,
    ensureExternalId,
  };
}

export async function createOdooBridgeClient(): Promise<OdooBridgeClient> {
  const config = requireOdooBridgeConfig();
  if (config.apiMode === 'json2') return createJson2Client(config);
  return createXmlRpcClient(config);
}
