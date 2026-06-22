import { NextResponse } from 'next/server';
import { safeErrorMessage } from '../../../../lib/odooBridge/config';
import { verifyPortalUser } from '../../../../lib/odooBridge/portal';

export const dynamic = 'force-dynamic';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const portalLogin = text(body.portalLogin);
  const pin = text(body.pin);

  if (!portalLogin || pin.length < 4) {
    return NextResponse.json({
      ok: false,
      error: 'portalLogin dan PIN wajib diisi untuk login portal Odoo.',
    }, { status: 400 });
  }

  try {
    const result = await verifyPortalUser(portalLogin, pin);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
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
