import { NextResponse } from 'next/server';
import { getKoloniNode } from '../../../../../lib/koloni';
import type { RoleId } from '../../../../../lib/types';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ koloniCode: string }>;
};

const roleIds: RoleId[] = ['member', 'surveyor', 'kurir', 'kasir', 'umkm', 'admin', 'koperasi'];

export async function POST(request: Request, context: RouteContext) {
  const { koloniCode } = await context.params;
  const body = await request.json().catch(() => ({}));
  const koloni = getKoloniNode(koloniCode);
  const roleId = roleIds.includes(body.roleId) ? body.roleId : 'member';
  const semutId = typeof body.semutId === 'string' && body.semutId.trim() ? body.semutId.trim() : 'SMT-DEMO-JOIN';

  return NextResponse.json({
    ok: true,
    colony: koloni,
    membership: {
      semutId,
      roleId,
      koloniCode: koloni.code,
      wilayahCode: koloni.wilayahCode,
      status: koloni.joinPolicy === 'open' ? 'active' : 'pending',
      requiresRolePin: true,
      ownerRole: roleId === 'admin' ? 'ratu_koloni' : 'semut_role',
    },
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
