import { NextResponse } from 'next/server';
import { createForumPost, listForumPosts } from '../../../../lib/odooBridge/forum';
import { safeErrorMessage } from '../../../../lib/odooBridge/config';

export const dynamic = 'force-dynamic';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const koloniCode = text(url.searchParams.get('koloniCode'));

  try {
    const payload = await listForumPosts(koloniCode || undefined);
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
  const sessionToken = text(body.sessionToken);
  const koloniCode = text(body.koloniCode);
  const title = text(body.title);
  const postBody = text(body.body);

  if (!semutId || !sessionToken && pin.length < 4 || !koloniCode || !title || !postBody) {
    return NextResponse.json({
      ok: false,
      error: 'semutId, sesi portal Odoo (atau PIN), koloniCode, title, dan body wajib diisi untuk membuat forum.post real.',
    }, { status: 400 });
  }

  try {
    const payload = await createForumPost({ semutId, portalLogin, pin, sessionToken: sessionToken || undefined, koloniCode, title, body: postBody });
    return NextResponse.json(payload, { status: 201, headers: { 'Cache-Control': 'no-store' } });
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
