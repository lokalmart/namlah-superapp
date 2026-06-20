import { NextResponse } from 'next/server';
import { buildUmkmOnboarding } from '../../../../lib/projectControlTower';
import { attachOdooBridgeResult } from '../../../../lib/odooBridge/writeBridge';

export const dynamic = 'force-dynamic';

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!hasText(body.semutId) || !hasText(body.businessName) || !hasText(body.koloniCode)) {
    return NextResponse.json({
      ok: false,
      error: 'semutId, businessName, dan koloniCode wajib diisi untuk onboarding UMKM real.',
    }, { status: 400 });
  }
  const response = await attachOdooBridgeResult(buildUmkmOnboarding(body));
  return NextResponse.json(response.payload, { status: response.status });
}
