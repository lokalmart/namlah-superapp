import { NextResponse } from 'next/server';
import { createOdooBridgeClientWithCredentials } from '../../../../lib/odooBridge/client';
import { createPortalSession, deletePortalSession } from '../../../../lib/odooBridge/session';
import { safeErrorMessage } from '../../../../lib/odooBridge/config';

export const dynamic = 'force-dynamic';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const login = text(body.login);
  const password = text(body.password);
  const url = text(body.url);

  if (!login || !password) {
    return NextResponse.json({
      ok: false,
      error: 'Login dan password Odoo wajib diisi.',
    }, { status: 400 });
  }

  try {
    const client = await createOdooBridgeClientWithCredentials(login, password, url || undefined);
    const users = await client.searchRead<{ id: number; login?: string; name?: string }>(
      'res.users',
      [['login', '=', login]],
      ['id', 'login', 'name'],
      { limit: 1 },
    );

    const user = users[0] || null;
    const sessionToken = createPortalSession(login, password, url || '', '');

    return NextResponse.json({
      ok: true,
      sessionToken,
      user: user
        ? { id: user.id, name: user.name, login: user.login }
        : { id: client.uid, login },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: safeErrorMessage(error),
    }, {
      status: 401,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = text(body.sessionToken);

  if (token) {
    deletePortalSession(token);
  }

  return NextResponse.json({ ok: true });
}
