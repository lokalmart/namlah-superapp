export type OdooApiMode = 'xmlrpc' | 'json2';

export type OdooBridgeConfig = {
  url: string;
  db: string;
  username: string;
  password: string;
  apiMode: OdooApiMode;
  defaultModule: string;
};

export type OdooBridgeStatus = {
  live: boolean;
  writesEnabled: boolean;
  configured: boolean;
  missingConnectionEnv: string[];
  missingRecommendedEnv: string[];
  apiMode: OdooApiMode;
  target?: {
    urlHost: string;
    db: string;
    username: string;
  };
};

const connectionEnv = ['ODOO_URL', 'ODOO_DB', 'ODOO_USERNAME', 'ODOO_PASSWORD'] as const;
const recommendedEnv = ['NAMLAH_BRIDGE_SECRET', 'IMPORT_DEFAULT_MODULE'] as const;

function clean(value: string | undefined) {
  return value?.trim() || '';
}

function boolEnv(name: string) {
  return ['1', 'true', 'yes', 'on'].includes(clean(process.env[name]).toLowerCase());
}

export function getOdooApiMode(): OdooApiMode {
  return clean(process.env.ODOO_API_MODE).toLowerCase() === 'json2' ? 'json2' : 'xmlrpc';
}

export function isOdooBridgeLive() {
  return boolEnv('NAMLAH_BRIDGE_LIVE');
}

export function areOdooWritesEnabled() {
  return boolEnv('NAMLAH_BRIDGE_WRITES');
}

export function getOdooBridgeStatus(): OdooBridgeStatus {
  const missingConnectionEnv = connectionEnv.filter((name) => !clean(process.env[name]));
  const missingRecommendedEnv = recommendedEnv.filter((name) => !clean(process.env[name]));
  const url = clean(process.env.ODOO_URL).replace(/\/+$/, '');
  let target: OdooBridgeStatus['target'];

  if (url && !missingConnectionEnv.length) {
    try {
      const parsed = new URL(url);
      target = {
        urlHost: parsed.host,
        db: clean(process.env.ODOO_DB),
        username: clean(process.env.ODOO_USERNAME),
      };
    } catch {
      target = undefined;
    }
  }

  return {
    live: isOdooBridgeLive(),
    writesEnabled: areOdooWritesEnabled(),
    configured: missingConnectionEnv.length === 0 && Boolean(target),
    missingConnectionEnv,
    missingRecommendedEnv,
    apiMode: getOdooApiMode(),
    target,
  };
}

export function requireOdooBridgeConfig(): OdooBridgeConfig {
  const status = getOdooBridgeStatus();
  if (!status.configured) {
    throw new Error(`Odoo bridge is not configured. Missing: ${status.missingConnectionEnv.join(', ') || 'valid ODOO_URL'}.`);
  }

  return {
    url: clean(process.env.ODOO_URL).replace(/\/+$/, ''),
    db: clean(process.env.ODOO_DB),
    username: clean(process.env.ODOO_USERNAME),
    password: clean(process.env.ODOO_PASSWORD),
    apiMode: status.apiMode,
    defaultModule: clean(process.env.IMPORT_DEFAULT_MODULE) || 'namlah_studio',
  };
}

export function safeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown Odoo bridge error.';
}
