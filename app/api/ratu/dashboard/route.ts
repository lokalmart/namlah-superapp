import { NextResponse } from 'next/server';
import { buildKoloniDashboard } from '../../../../lib/projectControlTower';
import { buildLiveKoloniDashboard } from '../../../../lib/odooBridge/dashboard';
import { isOdooBridgeLive, safeErrorMessage } from '../../../../lib/odooBridge/config';
import type { NamlahRatuView } from '../../../../lib/types';

export const dynamic = 'force-dynamic';

const ratuViews: NamlahRatuView[] = ['kanban', 'sales_orders', 'milestones', 'balance_sheet'];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = url.searchParams.get('role');
  if (role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Ratu Koloni role required.' }, { status: 403 });
  }

  const koloniCode = url.searchParams.get('koloniCode') || undefined;
  const viewParam = url.searchParams.get('view') as NamlahRatuView | null;
  const activeView = viewParam && ratuViews.includes(viewParam) ? viewParam : 'kanban';

  if (isOdooBridgeLive()) {
    try {
      const dashboard = await buildLiveKoloniDashboard('admin', koloniCode, activeView);
      return NextResponse.json(dashboard, { headers: { 'Cache-Control': 'no-store', 'x-namlah-dashboard-source': 'odoo_live' } });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        error: safeErrorMessage(error),
        fallbackAvailable: true,
      }, {
        status: 502,
        headers: { 'Cache-Control': 'no-store', 'x-namlah-dashboard-source': 'odoo_error' },
      });
    }
  }

  return NextResponse.json(buildKoloniDashboard('admin', koloniCode, activeView), {
    headers: { 'Cache-Control': 'no-store', 'x-namlah-dashboard-source': 'demo_local' },
  });
}
