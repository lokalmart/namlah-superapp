import { NextResponse } from 'next/server';
import { getOdooBridgeStatus } from '../../../../../lib/odooBridge/config';

export const dynamic = 'force-dynamic';

export async function POST() {
  const status = getOdooBridgeStatus();
  return NextResponse.json({
    ok: false,
    mode: status.live ? 'odoo_model_required' : 'odoo_required',
    bridge: status,
    error: status.live
      ? 'Approval parent koloni harus mengubah record Odoo real. Adapter relasi koloni belum disambungkan.'
      : 'Odoo bridge belum aktif. Approval parent koloni tidak boleh dibuat lokal.',
  }, {
    status: status.live ? 501 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
