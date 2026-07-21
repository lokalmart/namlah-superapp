type PortalSession = {
  token: string;
  login: string;
  password: string;
  url: string;
  db: string;
  createdAt: number;
};

const sessions = new Map<string, PortalSession>();
const SESSION_TTL_MS = 1000 * 60 * 60;

export function createPortalSession(login: string, password: string, url: string, db: string): string {
  const token = `odoo_portal_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  sessions.set(token, { token, login, password, url, db, createdAt: Date.now() });
  return token;
}

export function getPortalSession(token: string): PortalSession | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function deletePortalSession(token: string): boolean {
  return sessions.delete(token);
}

export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(token);
    }
  }
}

import type { OdooBridgeClient } from './client';

export async function createPortalClientFromSession(sessionToken: string): Promise<OdooBridgeClient | null> {
  const session = getPortalSession(sessionToken);
  if (!session) return null;
  const { createOdooBridgeClientWithCredentials } = await import('./client');
  return createOdooBridgeClientWithCredentials(session.login, session.password, session.url || undefined);
}
