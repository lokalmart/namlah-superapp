import { NextResponse } from 'next/server';
import { buildLiveKoloniDashboard } from '../../../../lib/odooBridge/dashboard';
import { isOdooBridgeLive, safeErrorMessage } from '../../../../lib/odooBridge/config';
import type { NamlahRatuView, RoleId } from '../../../../lib/types';

export const dynamic = 'force-dynamic';

const roleIds: RoleId[] = ['member', 'surveyor', 'kurir', 'kasir', 'umkm', 'admin', 'koperasi'];
const ratuViews: NamlahRatuView[] = ['kanban', 'sales_orders', 'milestones', 'balance_sheet'];

function parseRole(value: string | null): RoleId | undefined {
  return roleIds.find((roleId) => roleId === value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = parseRole(url.searchParams.get('role'));
  if (role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Ratu Semut role required.' }, { status: 403 });
  }
  const koloniCode = url.searchParams.get('koloniCode') || undefined;
  const viewParam = url.searchParams.get('view') as NamlahRatuView | null;
  const activeView = viewParam && ratuViews.includes(viewParam) ? viewParam : 'kanban';
  if (!isOdooBridgeLive()) {
    return NextResponse.json({
      ok: false,
      error: 'Odoo bridge belum aktif. Dashboard koloni hanya membaca data real dari Odoo.',
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
        'x-namlah-dashboard-source': 'odoo_required',
      },
    });
  }

  try {
    const dashboard = await buildLiveKoloniDashboard(role, koloniCode, activeView);
    return NextResponse.json(dashboard, {
      headers: {
        'Cache-Control': 'no-store',
        'x-namlah-dashboard-source': 'odoo_live',
      },
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: safeErrorMessage(error),
    }, {
      status: 502,
      headers: {
        'Cache-Control': 'no-store',
        'x-namlah-dashboard-source': 'odoo_error',
      },
    });
  }
}
