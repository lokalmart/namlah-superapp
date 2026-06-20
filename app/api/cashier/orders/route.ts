import { NextResponse } from 'next/server';
import { buildCashierTransaction } from '../../../../lib/projectControlTower';
import { attachOdooBridgeResult } from '../../../../lib/odooBridge/writeBridge';

export const dynamic = 'force-dynamic';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function amount(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(String(value || '').replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const semutId = text(body.semutId);
  const koloniCode = text(body.koloniCode);
  const deliveryCustomerName = text(body.deliveryCustomerName);
  const transactionAmount = amount(body.amount);

  if (!semutId || !koloniCode || !deliveryCustomerName || transactionAmount <= 0) {
    return NextResponse.json({
      ok: false,
      error: 'semutId, koloniCode, deliveryCustomerName, dan amount > 0 wajib diisi untuk transaksi kasir real.',
    }, { status: 400 });
  }

  const response = await attachOdooBridgeResult(buildCashierTransaction({
    semutId,
    koloniCode,
    amount: transactionAmount,
    deliveryCustomerName,
    deliveryPhone: text(body.deliveryPhone),
    deliveryAddress: text(body.deliveryAddress),
    note: text(body.note),
    transactionCode: text(body.transactionCode) || undefined,
  }));
  return NextResponse.json(response.payload, { status: response.status });
}
