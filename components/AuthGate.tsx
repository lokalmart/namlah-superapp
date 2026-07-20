'use client';

import { KeyRound, Sparkles, UserRoundPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PinPad } from './PinPad';
import { defaultKoloniCode, getJoinableKoloniNodes, getKoloniNode } from '../lib/koloni';
import { roleConfigs } from '../lib/roleConfig';
import { makePortalIdentity } from '../lib/portalIdentity';
import { createPinHashLocal, loadAccount, makeRoleAssignment, makeSemutId, saveAccount, verifyPinLocal } from '../lib/storage';
import type { SemutAccount } from '../lib/types';

type AuthGateProps = {
  onAuthenticated: (account: SemutAccount) => void;
};

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const existing = useMemo(() => loadAccount(), []);
  const [mode, setMode] = useState<'login' | 'create'>(existing ? 'login' : 'create');
  const [displayName, setDisplayName] = useState('');
  const [semutId, setSemutId] = useState('');
  const [koloniCode, setKoloniCode] = useState(defaultKoloniCode);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const joinableKoloni = getJoinableKoloniNodes();
  const selectedKoloni = getKoloniNode(koloniCode);

  async function createAccount() {
    if (!displayName.trim() || pin.length !== 4 || !selectedKoloni || creating) return;
    setCreating(true);
    setError('');
    const nextSemutId = semutId.trim() || makeSemutId(displayName);
    const portal = makePortalIdentity(nextSemutId);
    const pinHashLocal = createPinHashLocal(pin);

    try {
      const response = await fetch('/api/semut/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semutId: nextSemutId,
          displayName: displayName.trim(),
          koloniCode: selectedKoloni.code,
          pin,
        }),
      });
      const payload = await response.json().catch(() => null) as { ok?: boolean; bridge?: { message?: string } } | null;
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.bridge?.message || 'Registrasi portal belum berhasil.');
      }
    } catch (event) {
      setError(event instanceof Error ? event.message : 'Registrasi portal belum berhasil.');
      setCreating(false);
      return;
    }

    const account: SemutAccount = {
      semutId: nextSemutId,
      displayName: displayName.trim(),
      pinHashLocal,
      portalLogin: portal.portalLogin,
      portalStatus: portal.portalStatus,
      emailVerificationStatus: portal.emailVerificationStatus,
      roleAssignments: [makeRoleAssignment('member', pinHashLocal, selectedKoloni.code)],
      activeRoleId: 'member',
      experienceTheme: 'game',
    };
    saveAccount(account);
    onAuthenticated(account);
    setCreating(false);
  }

  async function login() {
    if (!existing) return setMode('create');
    if (verifyPinLocal(pin, existing.pinHashLocal)) {
      const portalLogin = existing.portalLogin || makePortalIdentity(existing.semutId).portalLogin;
      const response = await fetch('/api/semut/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalLogin, pin }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        setError(payload?.error || 'PIN lokal cocok, tetapi login portal Odoo belum berhasil.');
        setPin('');
        return;
      }
      onAuthenticated(existing);
      return;
    }
    setError('PIN belum cocok.');
    setPin('');
  }

  return (
    <main className="auth-screen">
      <section className="auth-art" aria-label="Peta konsep sarang Namlah">
        <div className="auth-map" />
        <div className="auth-copy">
          <div className="brand-lockup" aria-label="Namlah">
            <div className="brand-mark">N</div>
            <div>
              <strong>NAMLAH</strong>
              <span>Digital Superorganism for Collaboration</span>
            </div>
          </div>
          <p className="eyebrow">Namlah Superapp</p>
          <h1>Kita adalah satu koloni.</h1>
          <p className="muted">Semut-ID, Koloni, Sarang, Aktivitas, dan Layanan tersambung ke Odoo real.</p>
        </div>
      </section>

      <section className="auth-panel">
        {/* Mode Toggle - only show if existing account */}
        {existing && (
          <div className="auth-mode-toggle" style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
            <button
              type="button"
              className="auth-mode-btn"
              data-active={mode === 'login'}
              onClick={() => { setMode('login'); setPin(''); setError(''); }}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: mode === 'login' ? 'var(--role)' : 'transparent',
                color: mode === 'login' ? 'white' : 'var(--muted)',
                border: mode === 'login' ? 'none' : '1px solid var(--line)',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <KeyRound size={14} style={{ marginRight: '4px' }} /> Masuk
            </button>
            <button
              type="button"
              className="auth-mode-btn"
              data-active={mode === 'create'}
              onClick={() => { setMode('create'); setPin(''); setError(''); }}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: mode === 'create' ? 'var(--role)' : 'transparent',
                color: mode === 'create' ? 'white' : 'var(--muted)',
                border: mode === 'create' ? 'none' : '1px solid var(--line)',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <UserRoundPlus size={14} style={{ marginRight: '4px' }} /> Buat
            </button>
          </div>
        )}

        <div className="pin-panel">
          <div className="role-badge">
            {mode === 'create' ? <UserRoundPlus size={17} /> : <KeyRound size={17} />}
            {mode === 'create' ? 'Buat Semut-ID Baru' : existing?.semutId || 'Masuk'}
          </div>

          {mode === 'create' ? (
            <>
              <h2 style={{ marginTop: 16 }}>Buat akun portal Semut-ID.</h2>
              <div className="field-grid">
                <label>
                  Nama tampilan
                  <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Contoh: Sadja" />
                </label>
                <label>
                  Semut-ID
                  <input value={semutId} onChange={(event) => setSemutId(event.target.value)} placeholder="Otomatis bila dikosongkan" />
                </label>
                <label>
                  Koloni awal
                  <select value={koloniCode} onChange={(event) => setKoloniCode(event.target.value)}>
                    {joinableKoloni.map((node) => (
                      <option value={node.code} key={node.code}>{node.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="muted" style={{ margin: '8px 0 0' }}>
                Role Member akan dibuat di {selectedKoloni.name}. Email tidak wajib sekarang; login portal dibuat otomatis dari Semut-ID.
              </p>
              <div className="portal-preview">
                <span>Portal login otomatis</span>
                <strong>{semutId.trim() ? makePortalIdentity(semutId).portalLogin : 'dibuat setelah Semut-ID tersedia'}</strong>
                <small>Verifikasi email: tidak wajib</small>
              </div>
              <PinPad value={pin} onChange={setPin} onSubmit={createAccount} submitLabel={creating ? 'Mendaftarkan...' : 'Buat Portal Semut-ID'} disabled={!displayName.trim() || creating} />
              {error && <p style={{ color: 'var(--danger)', margin: '10px 0 0' }}>{error}</p>}
              {existing && (
                <button className="primary-action secondary" type="button" onClick={() => { setMode('login'); setPin(''); }} style={{ marginTop: 10 }}>
                  Masuk akun tersimpan
                </button>
              )}
            </>
          ) : (
            <>
              <h2 style={{ marginTop: 16 }}>Masuk dengan PIN 4 digit.</h2>
              <p className="muted">{existing?.displayName} / {roleConfigs[existing?.activeRoleId || 'member'].label}</p>
              <PinPad value={pin} onChange={(next) => { setError(''); setPin(next); }} onSubmit={login} submitLabel="Masuk" />
              {error && <p style={{ color: 'var(--danger)', margin: '10px 0 0' }}>{error}</p>}
              <button className="primary-action secondary" type="button" onClick={() => { setMode('create'); setPin(''); }} style={{ marginTop: 10 }}>
                Buat Semut-ID baru
              </button>
            </>
          )}
        </div>

        <div className="panel" style={{ padding: 16 }}>
          <p className="small-label">Role awal + koloni</p>
          <p className="muted" style={{ marginBottom: 12 }}>Akun baru wajib bergabung ke satu koloni sebagai Member. Role lain bisa ditambahkan dari Akun.</p>
          <div className="role-grid">
            {Object.values(roleConfigs).slice(0, 4).map((role) => (
              <div className="role-chip added" key={role.id} style={{ ['--role' as string]: role.theme }}>
                <Sparkles size={17} />
                {role.label}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
