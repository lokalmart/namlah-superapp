import { NextResponse } from 'next/server';
import { safeErrorMessage } from '../../../../lib/odooBridge/config';
import { auditOdooSchema } from '../../../../lib/odooBridge/schemaAudit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const audit = await auditOdooSchema();
    return NextResponse.json(audit, {
      status: audit.ok ? 200 : 200,
      headers: { 'Cache-Control': 'no-store' },
    });
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
