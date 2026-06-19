import { NextResponse } from 'next/server';
import { buildTaskStatusUpdate } from '../../../../../lib/projectControlTower';
import { attachOdooBridgeResult } from '../../../../../lib/odooBridge/writeBridge';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const [{ taskId }, body] = await Promise.all([
    context.params,
    request.json().catch(() => ({})),
  ]);
  const response = await attachOdooBridgeResult(buildTaskStatusUpdate(taskId, body));
  return NextResponse.json(response.payload, { status: response.status });
}
