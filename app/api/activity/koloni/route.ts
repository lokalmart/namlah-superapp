import { NextResponse } from 'next/server';
import { listKoloniActivities } from '../../../../lib/odooBridge/activity';
import { safeErrorMessage } from '../../../../lib/odooBridge/config';

export const dynamic = 'force-dynamic';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const koloniCode = text(url.searchParams.get('koloniCode'));

  if (!koloniCode) {
    return NextResponse.json({
      ok: false,
      error: 'koloniCode wajib diisi untuk membaca aktivitas Odoo.',
    }, { status: 400 });
  }

  try {
    const payload = await listKoloniActivities(koloniCode);
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: safeErrorMessage(error),
    }, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
