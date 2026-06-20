import { NextResponse } from 'next/server';
import { buildTaskStatusUpdate } from '../../../../../lib/projectControlTower';
import { attachOdooBridgeResult } from '../../../../../lib/odooBridge/writeBridge';
import type { RoleId } from '../../../../../lib/types';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

const roleIds: RoleId[] = ['member', 'surveyor', 'kurir', 'kasir', 'umkm', 'admin', 'koperasi'];

export async function PATCH(request: Request, context: RouteContext) {
  const [{ taskId }, body] = await Promise.all([
    context.params,
    request.json().catch(() => ({})),
  ]);
  if (!hasText(taskId) || !hasText(body.semutId) || !hasText(body.roleCode) || !hasText(body.koloniCode) || !hasText(body.stageCode) || !roleIds.includes(body.roleCode)) {
    return NextResponse.json({
      ok: false,
      error: 'taskId, semutId, roleCode valid, koloniCode, dan stageCode wajib diisi untuk update task real.',
    }, { status: 400 });
  }
  const response = await attachOdooBridgeResult(buildTaskStatusUpdate(taskId, body));
  return NextResponse.json(response.payload, { status: response.status });
}
