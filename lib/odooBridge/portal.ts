import { createOdooBridgeClientWithCredentials } from './client';

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
