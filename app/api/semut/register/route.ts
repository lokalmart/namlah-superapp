import { NextResponse } from 'next/server';
import { buildSemutRegistration } from '../../../../lib/projectControlTower';
import { attachOdooBridgeResult } from '../../../../lib/odooBridge/writeBridge';

export const dynamic = 'force-dynamic';

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!hasText(body.semutId) || !hasText(body.displayName) || !hasText(body.koloniCode)) {
    return NextResponse.json({
      ok: false,
      error: 'semutId, displayName, dan koloniCode wajib diisi untuk membuat portal user real.',
    }, { status: 400 });
  }
  const response = await attachOdooBridgeResult(buildSemutRegistration(body));
  return NextResponse.json(response.payload, { status: response.status });
}
