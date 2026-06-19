import { NextResponse } from 'next/server';
import { buildRoleApplication } from '../../../../lib/projectControlTower';
import { attachOdooBridgeResult } from '../../../../lib/odooBridge/writeBridge';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const response = await attachOdooBridgeResult(buildRoleApplication(body));
  return NextResponse.json(response.payload, { status: response.status });
}
