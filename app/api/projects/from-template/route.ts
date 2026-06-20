import { NextResponse } from 'next/server';
import { buildProjectFromTemplate } from '../../../../lib/projectControlTower';
import { attachOdooBridgeResult } from '../../../../lib/odooBridge/writeBridge';
import type { NamlahProjectTemplateCode, RoleId } from '../../../../lib/types';

export const dynamic = 'force-dynamic';

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

const roleIds: RoleId[] = ['member', 'surveyor', 'kurir', 'kasir', 'umkm', 'admin', 'koperasi'];
const templateCodes: NamlahProjectTemplateCode[] = [
  'cashier_transaction_flow',
  'member_shopping_flow',
  'umkm_onboarding_basic',
  'umkm_promotion_sprint',
  'survey_lokasi',
  'setup_kasir',
  'kurir_delivery',
  'donation_execution_plan',
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (
    !hasText(body.semutId) ||
    !hasText(body.roleCode) ||
    !hasText(body.templateCode) ||
    !hasText(body.koloniCode) ||
    !roleIds.includes(body.roleCode) ||
    !templateCodes.includes(body.templateCode)
  ) {
    return NextResponse.json({
      ok: false,
      error: 'semutId, roleCode valid, templateCode valid, dan koloniCode wajib diisi untuk aktivasi project template real.',
    }, { status: 400 });
  }
  const response = await attachOdooBridgeResult(buildProjectFromTemplate(body));
  return NextResponse.json(response.payload, { status: response.status });
}
