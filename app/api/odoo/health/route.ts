import { NextResponse } from 'next/server';
import { createOdooBridgeClient } from '../../../../lib/odooBridge/client';
import { getOdooBridgeStatus, safeErrorMessage } from '../../../../lib/odooBridge/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const bridge = getOdooBridgeStatus();
  if (!bridge.configured) {
    return NextResponse.json({
      ok: false,
      status: 'not_configured',
      bridge,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  try {
    const client = await createOdooBridgeClient();
    const health = await client.health();
    return NextResponse.json({
      ok: true,
      status: 'connected',
      bridge,
      health,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      status: 'connection_failed',
      bridge,
      error: safeErrorMessage(error),
    }, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
