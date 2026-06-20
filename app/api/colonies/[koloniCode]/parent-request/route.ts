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
  const parent = getKoloniNode(body.parentKoloniCode);
  const requesterSemutId = typeof body.semutId === 'string' && body.semutId.trim() ? body.semutId.trim() : child.primaryRatuSemutId;

  return NextResponse.json({
    ok: true,
    mode: 'demo_contract',
    relation: {
      childKoloniCode: child.code,
      parentKoloniCode: parent.code,
      status: 'requested',
      requestedBySemutId: requesterSemutId,
      approvalRole: 'ratu_koloni_parent',
    },
  }, {
    status: 202,
    headers: { 'Cache-Control': 'no-store' },
  });
}
