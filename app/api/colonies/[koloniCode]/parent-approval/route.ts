import { NextResponse } from 'next/server';
import { getKoloniNode } from '../../../../../lib/koloni';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ koloniCode: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { koloniCode } = await context.params;
  const body = await request.json().catch(() => ({}));
  const child = getKoloniNode(koloniCode);
  const parent = getKoloniNode(body.parentKoloniCode || child.parentKoloniCode);
  const approved = body.status !== 'rejected';
  const approverSemutId = typeof body.semutId === 'string' && body.semutId.trim() ? body.semutId.trim() : parent.primaryRatuSemutId;

  return NextResponse.json({
    ok: true,
    mode: 'demo_contract',
    relation: {
      childKoloniCode: child.code,
      parentKoloniCode: parent.code,
      status: approved ? 'approved' : 'rejected',
      approvedBySemutId: approverSemutId,
      ownershipTransferred: false,
    },
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
