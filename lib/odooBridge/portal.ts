import { createOdooBridgeClientWithCredentials, type OdooBridgeClient } from './client';
import { createPortalSession } from './session';

export async function verifyPortalUser(portalLogin: string, pin: string) {
  const login = portalLogin.trim();
  const password = pin.trim();
  if (!login || password.length < 4) {
    throw new Error('Portal login dan PIN wajib diisi.');
  }

  const client = await createOdooBridgeClientWithCredentials(login, password);
  const users = await client.searchRead<{ id: number; login?: string; name?: string; partner_id?: unknown }>(
    'res.users',
    [['login', '=', login]],
    ['id', 'login', 'name', 'partner_id'],
    { limit: 1 },
  ).catch(() => []);

  return {
    ok: true,
    uid: client.uid,
    user: users[0] || null,
  };
}

export async function verifyOdooPortalUser(login: string, password: string, url?: string) {
  const trimmedLogin = login.trim();
  const trimmedPassword = password.trim();
  if (!trimmedLogin || !trimmedPassword) {
    throw new Error('Login dan password Odoo wajib diisi.');
  }

  const client = await createOdooBridgeClientWithCredentials(trimmedLogin, trimmedPassword, url);
  const users = await client.searchRead<{ id: number; login?: string; name?: string }>(
    'res.users',
    [['login', '=', trimmedLogin]],
    ['id', 'login', 'name'],
    { limit: 1 },
  ).catch(() => []);

  const targetUrl = url || '';
  const sessionToken = createPortalSession(trimmedLogin, trimmedPassword, targetUrl, '');

  return {
    ok: true,
    sessionToken,
    user: users[0] || { id: client.uid, login: trimmedLogin },
  };
}

export async function createPortalClientFromSession(sessionToken: string): Promise<OdooBridgeClient | null> {
  const { getPortalSession } = await import('./session');
  const session = getPortalSession(sessionToken);
  if (!session) return null;
  return createOdooBridgeClientWithCredentials(session.login, session.password, session.url || undefined);
}
