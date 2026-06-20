import { NextResponse } from 'next/server';
import { getOdooBridgeStatus } from '../../../lib/odooBridge/config';

export const dynamic = 'force-dynamic';

function realOnlyResponse() {
  const status = getOdooBridgeStatus();
  return NextResponse.json({
    ok: false,
    mode: status.live ? 'odoo_model_required' : 'odoo_required',
    bridge: status,
    error: status.live
      ? 'Endpoint koloni harus membaca/menulis model koloni Odoo real. Adapter koloni belum disambungkan.'
      : 'Odoo bridge belum aktif. Data koloni tidak boleh dikirim dari mekanisme lokal.',
  }, {
    status: status.live ? 501 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function GET() {
  return realOnlyResponse();
}

export async function POST() {
  return realOnlyResponse();
}
