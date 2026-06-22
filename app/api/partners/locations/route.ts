import { NextResponse } from 'next/server';
import { listPartnerLocationPins, updatePartnerLocation } from '../../../../lib/odooBridge/partnerLocation';
import { safeErrorMessage } from '../../../../lib/odooBridge/config';

export const dynamic = 'force-dynamic';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(String(value || '').replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) ? parsed : NaN;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const koloniCode = text(url.searchParams.get('koloniCode'));

  try {
    const payload = await listPartnerLocationPins(koloniCode || undefined);
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: safeErrorMessage(error),
    }, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const semutId = text(body.semutId);
  const portalLogin = text(body.portalLogin);
  const pin = text(body.pin);
  const roleCode = text(body.roleCode) || 'member';
  const koloniCode = text(body.koloniCode);
  const latitude = numberValue(body.latitude);
  const longitude = numberValue(body.longitude);

  if (!semutId || pin.length < 4 || !koloniCode || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({
      ok: false,
      error: 'semutId, PIN portal, koloniCode, latitude, dan longitude wajib valid.',
    }, { status: 400 });
  }

  try {
    const payload = await updatePartnerLocation({
      semutId,
      portalLogin,
      pin,
      latitude,
      longitude,
      roleCode,
      koloniCode,
      label: text(body.label),
      source: text(body.source) || 'namlah-superapp',
    });
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: safeErrorMessage(error),
    }, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
