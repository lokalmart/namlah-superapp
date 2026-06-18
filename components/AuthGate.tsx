'use client';

import { KeyRound, Sparkles, UserRoundPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PinPad } from './PinPad';
import { roleConfigs } from '../lib/mockData';
import { createPinHashDemo, loadAccount, makeSemutId, saveAccount, verifyPinDemo } from '../lib/storage';
import type { SemutAccount } from '../lib/types';

type AuthGateProps = {
  onAuthenticated: (account: SemutAccount) => void;
};

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const existing = useMemo(() => loadAccount(), []);
  const [mode, setMode] = useState<'login' | 'create'>(existing ? 'login' : 'create');
  const [displayName, setDisplayName] = useState('');
  const [semutId, setSemutId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function createAccount() {
    if (!displayName.trim() || pin.length !== 4) return;
    const account: SemutAccount = {
      semutId: semutId.trim() || makeSemutId(displayName),
      displayName: displayName.trim(),
      pinHashDemo: createPinHashDemo(pin),
      roles: ['member'],
      activeRoleId: 'member',
    };
    saveAccount(account);
    onAuthenticated(account);
  }

  function login() {
    if (!existing) return setMode('create');
    if (verifyPinDemo(pin, existing.pinHashDemo)) {
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
          <p className="eyebrow">Namlah Superapp</p>
          <h1>Satu Semut-ID untuk banyak peran koloni.</h1>
          <p className="muted">Showcase frontend untuk map sarang, role-ID, gudang, scan jejak, dan akun lokal.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="pin-panel">
          <div className="role-badge">
            {mode === 'create' ? <UserRoundPlus size={17} /> : <KeyRound size={17} />}
            {mode === 'create' ? 'Create Semut-ID' : existing?.semutId || 'Semut-ID'}
          </div>

          {mode === 'create' ? (
            <>
              <h2 style={{ marginTop: 16 }}>Buat akun portal dummy.</h2>
              <div className="field-grid">
                <label>
                  Nama tampilan
                  <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Contoh: Sadja" />
                </label>
                <label>
                  Semut-ID
                  <input value={semutId} onChange={(event) => setSemutId(event.target.value)} placeholder="Otomatis bila dikosongkan" />
                </label>
              </div>
              <PinPad value={pin} onChange={setPin} onSubmit={createAccount} submitLabel="Buat Semut-ID" disabled={!displayName.trim()} />
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
          <p className="small-label">Role awal</p>
          <p className="muted" style={{ marginBottom: 12 }}>Akun baru dimulai sebagai Member. Role lain bisa ditambahkan dari Akun.</p>
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
