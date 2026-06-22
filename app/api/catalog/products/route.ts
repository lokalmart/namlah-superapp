import { NextResponse } from 'next/server';
import { ensureCatalogProducts, listCatalogProducts } from '../../../../lib/odooBridge/catalog';
import { safeErrorMessage } from '../../../../lib/odooBridge/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await listCatalogProducts();
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

export async function POST() {
  try {
    const payload = await ensureCatalogProducts();
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
