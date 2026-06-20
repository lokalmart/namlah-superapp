import { NextResponse } from 'next/server';
import { getOdooBridgeStatus } from '../../../../../lib/odooBridge/config';

export const dynamic = 'force-dynamic';

export async function PATCH() {
  const status = getOdooBridgeStatus();
  return NextResponse.json({
    ok: false,
    mode: status.live ? 'odoo_model_required' : 'odoo_required',
    bridge: status,
    error: status.live
      ? 'Policy koloni harus disimpan ke model/policy Odoo real. Adapter koloni belum disambungkan.'
      : 'Odoo bridge belum aktif. Policy koloni tidak boleh disimpan sebagai kontrak lokal.',
  }, {
    status: status.live ? 501 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
