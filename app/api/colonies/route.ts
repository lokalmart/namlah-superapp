import { NextResponse } from 'next/server';
import { defaultKoloniCode, describeKoloniPolicy, getJoinableKoloniNodes, getKoloniNode } from '../../../lib/koloni';

export const dynamic = 'force-dynamic';

function cleanKoloniCode(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'koloni_baru';
}

export async function GET() {
  const colonies = getJoinableKoloniNodes().map((node) => ({
    ...node,
    policy: describeKoloniPolicy(node),
  }));

  return NextResponse.json({
    ok: true,
    defaultKoloniCode,
    colonies,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'Koloni Baru';
  const geoAreaName = typeof body.geoAreaName === 'string' && body.geoAreaName.trim() ? body.geoAreaName.trim() : 'Wilayah Baru';
  const creatorSemutId = typeof body.semutId === 'string' && body.semutId.trim() ? body.semutId.trim() : 'SMT-RATU-NEW';
  const code = `koloni_${cleanKoloniCode(name)}`;
  const node = getKoloniNode(body.parentKoloniCode);

  return NextResponse.json({
    ok: true,
    mode: 'demo_contract',
    colony: {
      code,
      name,
      wilayahCode: `wilayah_${cleanKoloniCode(geoAreaName)}`,
      geoAreaCode: `geo_${cleanKoloniCode(geoAreaName)}`,
      geoAreaName,
      level: 'koloni',
      status: 'pending',
      accessMode: body.accessMode === 'inclusive' ? 'inclusive' : 'exclusive',
      joinPolicy: 'approval_required',
      catalogVisibility: 'private',
      collaborationVisibility: 'private',
      primaryRatuSemutId: creatorSemutId,
      parentKoloniCode: body.parentKoloniCode ? node.code : undefined,
      parentRelationStatus: body.parentKoloniCode ? 'requested' : undefined,
    },
    membership: {
      semutId: creatorSemutId,
      roleId: 'admin',
      label: 'Ratu Semut',
      koloniCode: code,
      status: 'active',
      requiresRolePin: true,
    },
  }, {
    status: 201,
    headers: { 'Cache-Control': 'no-store' },
  });
}
