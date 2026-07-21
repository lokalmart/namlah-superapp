'use client';

import { Crown, Loader2, MessageCircle, Plus, RefreshCcw, Send, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { makePortalIdentity } from '../lib/portalIdentity';
import { getActiveRoleAssignment } from '../lib/storage';
import type { AppTab, RoleConfig, SemutAccount } from '../lib/types';

type ForumPanelProps = {
  account: SemutAccount;
  role: RoleConfig;
  onTabChange: (tab: AppTab) => void;
};

type ForumPost = {
  id: string;
  odooId: number;
  title: string;
  body: string;
  author: string;
  forum: string;
  createdAt: string;
  koloniCode: string;
};

type ForumPayload = {
  ok: boolean;
  posts?: ForumPost[];
  post?: ForumPost;
  error?: string;
};

function formatPostTime(value: string) {
  if (!value) return 'Odoo';
  const parsed = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return 'Odoo';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

export function ForumPanel({ account, role, onTabChange }: ForumPanelProps) {
  const assignment = getActiveRoleAssignment(account);
  const koloniCode = assignment?.koloniCode || 'KOLONI-DEFAULT';
  const portalLogin = account.portalLogin || makePortalIdentity(account.semutId).portalLogin;
  const isAdmin = account.activeRoleId === 'admin';
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<{ tone: 'idle' | 'success' | 'error'; text: string }>({
    tone: 'idle',
    text: 'Forum membaca dan menulis record Odoo website_forum.',
  });

  const canSubmit = useMemo(() => title.trim().length > 2 && body.trim().length > 4 && (account.odooPortalMode || pin.trim().length >= 4), [body, pin, title, account.odooPortalMode]);

  async function loadPosts() {
    setLoading(true);
    setStatus((current) => current.tone === 'success' ? current : {
      tone: 'idle',
      text: 'Mengambil thread forum dari Odoo...',
    });
    try {
      const response = await fetch(`/api/forum/posts?koloniCode=${encodeURIComponent(koloniCode)}`, { cache: 'no-store' });
      const payload = await response.json().catch(() => null) as ForumPayload | null;
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Forum Odoo belum bisa dibaca.');
      }
      setPosts(payload.posts || []);
      setStatus({
        tone: 'success',
        text: `Terhubung ke Odoo Forum. ${payload.posts?.length || 0} thread terbaca untuk ${koloniCode}.`,
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Forum Odoo belum bisa dibaca.',
      });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function submitPost() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setStatus({ tone: 'idle', text: 'Mengirim thread sebagai portal user Odoo...' });
    try {
      const requestBody: Record<string, unknown> = {
        semutId: account.semutId,
        koloniCode,
        title,
        body,
      };
      if (account.odooPortalMode && account.odooPortalSessionToken) {
        requestBody.sessionToken = account.odooPortalSessionToken;
      } else {
        requestBody.portalLogin = portalLogin;
        requestBody.pin = pin;
      }
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const payload = await response.json().catch(() => null) as ForumPayload | null;
      if (!response.ok || !payload?.ok || !payload.post) {
        throw new Error(payload?.error || 'Thread belum berhasil dibuat di Odoo.');
      }
      setPosts((current) => [payload.post as ForumPost, ...current]);
      setTitle('');
      setBody('');
      setPin('');
      setStatus({
        tone: 'success',
        text: `Thread forum.post #${payload.post.odooId} dibuat oleh ${portalLogin}.`,
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Thread belum berhasil dibuat di Odoo.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, [koloniCode]);

  return (
    <section className="screen-panel forum-screen" aria-label="Forum koloni">
      <header className="screen-header forum-header">
        <div>
          <p className="eyebrow">Odoo Forum</p>
          <h2>Percakapan koloni dari record forum.post.</h2>
          <p className="muted">{koloniCode} / {role.label} / {portalLogin}</p>
        </div>
        <button className="icon-action forum-compose" type="button" onClick={() => setTitle((current) => current || `${role.label} ${koloniCode}`)}>
          <Plus size={17} />
          Tulis
        </button>
      </header>

      <div className="screen-scroll forum-scroll">
        <section className="forum-segment" aria-label="Ruang forum Odoo">
          <button className="active" type="button">forum.post</button>
          <button type="button">portal user</button>
          <button type="button">Odoo live</button>
        </section>

        <section className="forum-compose-card" aria-label="Tulis thread Odoo">
          <div className="forum-compose-title">
            <ShieldCheck size={18} />
            <div>
              <strong>Post sebagai portal user</strong>
              <span>{account.odooPortalMode ? 'Masuk sebagai portal user Odoo asli.' : 'PIN harus sama dengan password portal Odoo untuk ' + portalLogin + '.'}</span>
            </div>
          </div>
          <label>
            Judul thread
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`Update ${koloniCode}`} />
          </label>
          <label>
            Isi forum
            <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} placeholder="Tulis update kerja koloni..." />
          </label>
          {!account.odooPortalMode && (
            <label>
              PIN portal Odoo
              <input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 8))} inputMode="numeric" type="password" placeholder="PIN portal" />
            </label>
          )}
          <button className="primary-action" type="button" onClick={submitPost} disabled={!canSubmit || submitting}>
            {submitting ? <Loader2 size={17} className="spin-icon" /> : <Send size={17} />}
            Kirim ke Odoo Forum
          </button>
        </section>

        <section className="forum-thread-stack" aria-label="Thread forum Odoo">
          <div className="forum-list-head">
            <strong>Thread Odoo</strong>
            <button type="button" onClick={loadPosts} disabled={loading}>
              {loading ? <Loader2 size={14} className="spin-icon" /> : <RefreshCcw size={14} />}
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="forum-empty-state"><Loader2 size={18} className="spin-icon" /> Membaca forum.post dari Odoo...</div>
          ) : posts.length ? (
            posts.map((post) => (
              <article className="forum-thread green" key={post.id}>
                <div className="forum-thread-icon"><MessageCircle size={20} /></div>
                <div>
                  <header>
                    <strong>{post.title}</strong>
                    <span>{formatPostTime(post.createdAt)}</span>
                  </header>
                  <p>{post.body || 'Konten forum Odoo kosong.'}</p>
                  <div className="forum-thread-meta">
                    <span>{post.forum}</span>
                    <span>{post.author}</span>
                    <span>#{post.odooId}</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="forum-empty-state">
              <MessageCircle size={18} />
              Belum ada forum.post Odoo untuk {koloniCode}.
            </div>
          )}
        </section>

        <section className={`forum-action-card bridge-status ${status.tone}`}>
          <MessageCircle size={19} />
          <div>
            <strong>{status.tone === 'error' ? 'Forum belum tersambung' : status.tone === 'success' ? 'Forum Odoo tersambung' : 'Odoo Forum'}</strong>
            <span>{status.text}</span>
          </div>
          <button type="button" onClick={() => onTabChange(isAdmin ? 'ratu' : 'scan')}>
            {isAdmin ? <Crown size={16} /> : <Send size={16} />}
            {isAdmin ? 'Buka Ratu' : 'Aktivitas'}
          </button>
        </section>
      </div>
    </section>
  );
}
