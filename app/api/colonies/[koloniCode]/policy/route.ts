import { NextResponse } from 'next/server';
import { describeKoloniPolicy, getKoloniNode, type KoloniAccessMode, type KoloniVisibilityPolicy } from '../../../../../lib/koloni';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ koloniCode: string }>;
};

const visibilityValues: KoloniVisibilityPolicy[] = ['private', 'parent_scope', 'public_catalog'];

export async function PATCH(request: Request, context: RouteContext) {
  const { koloniCode } = await context.params;
  const body = await request.json().catch(() => ({}));
  const koloni = getKoloniNode(koloniCode);
  const accessMode: KoloniAccessMode = body.accessMode === 'inclusive' ? 'inclusive' : 'exclusive';
  const catalogVisibility = visibilityValues.includes(body.catalogVisibility) ? body.catalogVisibility : koloni.catalogVisibility;
  const collaborationVisibility = visibilityValues.includes(body.collaborationVisibility) ? body.collaborationVisibility : koloni.collaborationVisibility;

  return NextResponse.json({
    ok: true,
    mode: 'demo_contract',
    colony: {
      ...koloni,
      accessMode,
      catalogVisibility,
      collaborationVisibility,
    },
    policy: {
      ...describeKoloniPolicy(koloni),
      accessMode,
      catalogVisibility,
      collaborationVisibility,
    },
    note: 'Policy update is a mock gateway contract; real persistence belongs in the Namlah bridge/Odoo adapter.',
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
