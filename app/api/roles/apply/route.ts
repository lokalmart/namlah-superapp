import { NextResponse } from 'next/server';
import { buildRoleApplication } from '../../../../lib/projectControlTower';
import { attachOdooBridgeResult } from '../../../../lib/odooBridge/writeBridge';
import type { RoleId } from '../../../../lib/types';

export const dynamic = 'force-dynamic';

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

const roleIds: RoleId[] = ['member', 'surveyor', 'kurir', 'kasir', 'umkm', 'admin', 'koperasi'];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!hasText(body.semutId) || !hasText(body.roleCode) || !hasText(body.koloniCode) || !roleIds.includes(body.roleCode)) {
    return NextResponse.json({
      ok: false,
      error: 'semutId, roleCode valid, dan koloniCode wajib diisi untuk pengajuan role real.',
    }, { status: 400 });
  }
  const response = await attachOdooBridgeResult(buildRoleApplication(body));
  return NextResponse.json(response.payload, { status: response.status });
}
