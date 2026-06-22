import { Crown, Gamepad2, Loader2, LocateFixed, LogOut, Mail, MapPin, Phone, Plus, ShieldCheck, Sparkles, UserRoundCog } from 'lucide-react';
import { useState } from 'react';
import { PinPad } from './PinPad';
import { defaultKoloniCode, describeKoloniPolicy, getJoinableKoloniNodes, getKoloniNode, getKoloniScope } from '../lib/koloni';
import { roleConfigs, roleOrder } from '../lib/roleConfig';
import { getCustomFieldsByModel, makePortalActor } from '../lib/odooArchitecture';
import { activateRole, clearAccount, getActiveRoleAssignment, getRoleAssignment, getRoleIds, registerRole, setExperienceTheme, verifyRolePinLocal } from '../lib/storage';
import type { ExperienceTheme, RoleConfig, RoleId, SemutAccount } from '../lib/types';

type AccountPanelProps = {
  account: SemutAccount;
  role: RoleConfig;
  onChange: (account: SemutAccount) => void;
  onLogout: () => void;
};

type LocationPayload = {
  ok?: boolean;
  partner?: {
    odooId: number;
    updatedAt: string;
  };
  createdFields?: number;
  error?: string;
};

export function AccountPanel({ account, role, onChange, onLogout }: AccountPanelProps) {
  const actor = makePortalActor(account);
  const roleIds = getRoleIds(account);
  const activeAssignment = getActiveRoleAssignment(account);
  const activeKoloni = getKoloniNode(activeAssignment?.koloniCode);
  const activeKoloniScope = getKoloniScope(activeAssignment?.koloniCode);
  const activeKoloniPolicy = describeKoloniPolicy(activeKoloni);
  const joinableKoloni = getJoinableKoloniNodes();
  const taskFields = getCustomFieldsByModel('project.task').slice(0, 5);
  const orderFields = getCustomFieldsByModel('sale.order').slice(0, 4);
  const [switchRoleId, setSwitchRoleId] = useState<RoleId | null>(null);
  const [registerRoleId, setRegisterRoleId] = useState<RoleId | null>(null);
  const [rolePin, setRolePin] = useState('');
  const [roleKoloniCode, setRoleKoloniCode] = useState(activeAssignment?.koloniCode || defaultKoloniCode);
  const [roleMessage, setRoleMessage] = useState('');
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [locationLat, setLocationLat] = useState('');
  const [locationLng, setLocationLng] = useState('');
  const [locationPin, setLocationPin] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [locationSubmitting, setLocationSubmitting] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  function selectRole(roleId: RoleId) {
    if (account.activeRoleId === roleId) return;
    const assignment = getRoleAssignment(account, roleId);
    if (!assignment) {
      setRegisterRoleId(roleId);
      setSwitchRoleId(null);
      setRolePin('');
      setRoleMessage(`Buat PIN khusus untuk ${roleConfigs[roleId].label}.`);
      return;
    }
    setSwitchRoleId(roleId);
    setRegisterRoleId(null);
    setRolePin('');
    setRoleMessage(`Masukkan PIN ${roleConfigs[roleId].label}.`);
  }

  function submitSwitchRole() {
    if (!switchRoleId) return;
    const assignment = getRoleAssignment(account, switchRoleId);
    if (!verifyRolePinLocal(rolePin, assignment)) {
      setRoleMessage('PIN role belum cocok.');
      setRolePin('');
      return;
    }
    onChange(activateRole(account, switchRoleId));
    setSwitchRoleId(null);
    setRolePin('');
    setRoleMessage('');
  }

  async function submitRegisterRole() {
    if (!registerRoleId || rolePin.length !== 4 || roleSubmitting) return;
    setRoleSubmitting(true);
    setRoleMessage('Mengirim pendaftaran role ke Odoo...');
    try {
      const response = await fetch('/api/roles/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semutId: account.semutId,
          roleCode: registerRoleId,
          koloniCode: roleKoloniCode,
        }),
      });
      const payload = await response.json().catch(() => null) as { bridge?: { message?: string }; error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.bridge?.message || payload?.error || 'Role belum masuk Odoo.');
      }
      onChange(registerRole(account, registerRoleId, rolePin, roleKoloniCode));
      setRegisterRoleId(null);
      setRolePin('');
      setRoleMessage('');
    } catch (event) {
      setRoleMessage(event instanceof Error ? event.message : 'Role belum masuk Odoo.');
    } finally {
      setRoleSubmitting(false);
    }
  }

  function selectTheme(experienceTheme: ExperienceTheme) {
    onChange(setExperienceTheme(account, experienceTheme));
  }

  function resetLocalSession() {
    clearAccount();
    onLogout();
  }

  function useCurrentLocation() {
    setLocationMessage('');
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationMessage('Browser belum mengizinkan GPS perangkat.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLat(position.coords.latitude.toFixed(7));
        setLocationLng(position.coords.longitude.toFixed(7));
        setLocationMessage('GPS perangkat terbaca. Kirim untuk update partner Odoo.');
      },
      (error) => setLocationMessage(error.message || 'GPS perangkat belum bisa dibaca.'),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  async function submitPartnerLocation() {
    if (locationSubmitting) return;
    const latitude = Number(locationLat);
    const longitude = Number(locationLng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || locationPin.length < 4) {
      setLocationMessage('Latitude, longitude, dan PIN portal wajib valid.');
      return;
    }
    setLocationSubmitting(true);
    setLocationMessage('Mengupdate lokasi GPS ke res.partner Odoo...');
    try {
      const response = await fetch('/api/partners/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semutId: account.semutId,
          portalLogin: actor.portalLogin,
          pin: locationPin,
          latitude,
          longitude,
          roleCode: account.activeRoleId,
          koloniCode: activeAssignment?.koloniCode || activeKoloni.code,
          label: locationLabel,
          source: account.activeRoleId === 'kurir' ? 'namlah-superapp-kurir' : 'namlah-superapp-account',
        }),
      });
      const payload = await response.json().catch(() => null) as LocationPayload | null;
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || 'Lokasi GPS belum tersimpan di Odoo.');
      }
      setLocationPin('');
      setLocationMessage(`Lokasi tersimpan ke res.partner #${payload?.partner?.odooId || '-'} di Odoo.`);
    } catch (event) {
      setLocationMessage(event instanceof Error ? event.message : 'Lokasi GPS belum tersimpan di Odoo.');
    } finally {
      setLocationSubmitting(false);
    }
  }

  return (
    <section className="screen-panel">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Pengaturan Akun</p>
          <h2>Semut-ID, Portal Actor, dan Role-ID.</h2>
        </div>
        <span className="role-badge"><UserRoundCog size={17} /> {role.label}</span>
      </header>

      <div className="screen-scroll">
        <div className="account-layout">
          <aside className="account-card profile-hero-card">
            <div className="profile-canopy">
              <div className="profile-avatar" aria-hidden="true">
                {account.displayName.slice(0, 1).toUpperCase() || 'N'}
              </div>
            </div>
            <div className="profile-identity">
              <p className="small-label">Semut-ID</p>
              <h3>{account.displayName}</h3>
              <p className="muted">@{actor.portalLogin}</p>
              <span>{account.semutId}</span>
            </div>
            <div className="profile-stat-row" aria-label="Ringkasan profil">
              <span><strong>{roleIds.length}</strong>Role</span>
              <span><strong>{activeKoloniScope.childCount}</strong>Sarang</span>
              <span><strong>{role.quickStats.length}</strong>Proyek</span>
              <span><strong>4.9</strong>Rating</span>
            </div>
            <div className="portal-map">
              <span>res.partner</span>
              <strong>{actor.partnerExternalId}</strong>
              <span>res.users portal</span>
              <strong>{actor.userExternalId}</strong>
              <span>portal login</span>
              <strong>{actor.portalLogin}</strong>
              <span>verifikasi email</span>
              <strong>{actor.emailRequired ? actor.emailVerificationStatus : 'tidak wajib'}</strong>
              <span>koloni / wilayah</span>
              <strong>{actor.koloniCode} / {actor.wilayahCode}</strong>
              <span>role aktif</span>
              <strong>{activeAssignment?.roleId || '-'} / {activeAssignment?.status || '-'}</strong>
            </div>
            <div className="theme-switch" aria-label="Pilih experience">
              <button className={account.experienceTheme === 'modern' ? 'theme-option active' : 'theme-option'} type="button" onClick={() => selectTheme('modern')}>
                <Sparkles size={16} />
                Modern
              </button>
              <button className={account.experienceTheme === 'game' ? 'theme-option active' : 'theme-option'} type="button" onClick={() => selectTheme('game')}>
                <Gamepad2 size={16} />
                Game
              </button>
            </div>
            <button className="icon-action" type="button" onClick={onLogout}>
              <LogOut size={17} />
              Kunci App
            </button>
            <button className="icon-action" type="button" onClick={resetLocalSession} style={{ marginTop: 10 }}>
              <ShieldCheck size={17} />
              Reset sesi perangkat
            </button>
          </aside>

          <div className="account-card odoo-field-card">
            <p className="small-label">Odoo custom fields</p>
            <h3>Project Task + Sales Order</h3>
            <div className="field-pill-row stacked">
              {taskFields.map((field) => <span key={field.name}>task: {field.name}</span>)}
              {orderFields.map((field) => <span key={field.name}>order: {field.name}</span>)}
            </div>
          </div>

          <div className="account-card contact-card">
            <p className="small-label">Kontak Ratu Koloni</p>
            <h3>{activeKoloniPolicy.primaryRatuName}</h3>
            <p className="muted">{activeKoloni.name} / {activeKoloniPolicy.primaryRatuSemutId}</p>
            <div className="contact-action-row">
              {activeKoloniPolicy.primaryRatuPhone ? (
                <a href={`tel:${activeKoloniPolicy.primaryRatuPhone}`}>
                  <Phone size={16} />
                  {activeKoloniPolicy.primaryRatuPhone}
                </a>
              ) : null}
              {activeKoloniPolicy.primaryRatuEmail ? (
                <a href={`mailto:${activeKoloniPolicy.primaryRatuEmail}`}>
                  <Mail size={16} />
                  {activeKoloniPolicy.primaryRatuEmail}
                </a>
              ) : null}
              {!activeKoloniPolicy.primaryRatuPhone && !activeKoloniPolicy.primaryRatuEmail && (
                <p className="muted" style={{ margin: 0 }}>Kontak Ratu menunggu data koloni Odoo.</p>
              )}
            </div>
            <div className="portal-map compact">
              <span>koloni</span>
              <strong>{activeKoloni.code}</strong>
              <span>wilayah</span>
              <strong>{activeKoloni.geoAreaName}</strong>
              <span>sumber kontak</span>
              <strong>Odoo / konfigurasi koloni</strong>
            </div>
          </div>

          <div className="account-card location-card">
            <p className="small-label">Lokasi GPS Partner</p>
            <h3>Pin peta dari res.partner.</h3>
            <p className="muted">
              Semut-ID dan Kurir mengupdate lokasi ke partner portal Odoo. Partner company otomatis tampil sebagai Koloni.
            </p>
            <div className="field-grid location-grid">
              <label>
                Latitude
                <input inputMode="decimal" value={locationLat} onChange={(event) => setLocationLat(event.target.value)} placeholder="-6.7320000" />
              </label>
              <label>
                Longitude
                <input inputMode="decimal" value={locationLng} onChange={(event) => setLocationLng(event.target.value)} placeholder="108.5523000" />
              </label>
              <label>
                PIN portal Odoo
                <input type="password" inputMode="numeric" value={locationPin} onChange={(event) => setLocationPin(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="PIN portal" />
              </label>
              <label>
                Catatan lokasi
                <input value={locationLabel} onChange={(event) => setLocationLabel(event.target.value)} placeholder={account.activeRoleId === 'kurir' ? 'Posisi kurir saat ini' : 'Lokasi sarang/aktivitas'} />
              </label>
            </div>
            <div className="location-action-row">
              <button className="icon-action" type="button" onClick={useCurrentLocation}>
                <LocateFixed size={17} />
                Ambil GPS
              </button>
              <button className="primary-action" type="button" onClick={submitPartnerLocation} disabled={locationSubmitting}>
                {locationSubmitting ? <Loader2 size={17} className="spin-icon" /> : <MapPin size={17} />}
                Update Odoo
              </button>
            </div>
            {locationMessage ? <p className="muted location-message">{locationMessage}</p> : null}
          </div>

          {account.activeRoleId === 'admin' && (
            <div className="account-card">
              <p className="small-label">Configurator Ratu Koloni</p>
              <h3>{activeKoloni.name}</h3>
              <p className="muted">{activeKoloni.geoAreaName} / {activeKoloniScope.label}</p>
              <div className="portal-map">
                <span>ratu utama</span>
                <strong>{activeKoloniPolicy.primaryRatuSemutId}</strong>
                <span>mode</span>
                <strong>{activeKoloniPolicy.accessMode}</strong>
                <span>join policy</span>
                <strong>{activeKoloniPolicy.joinPolicy}</strong>
                <span>catalog</span>
                <strong>{activeKoloniPolicy.catalogVisibility}</strong>
                <span>parent</span>
                <strong>{activeKoloni.parentKoloniCode || 'mandiri'} / {activeKoloni.parentRelationStatus || '-'}</strong>
              </div>
              <p className="muted" style={{ marginTop: 12 }}>
                Ratu Koloni mengatur koloni ini. Relasi parent-child memberi visibility sesuai policy, tidak memindahkan kepemilikan koloni.
              </p>
            </div>
          )}

          <div className="account-card">
            <p className="small-label">Class / Role-ID aktif</p>
            <h3>{role.label}</h3>
            <p className="muted">{role.summary}</p>
            <div className="role-grid" style={{ marginTop: 14 }}>
              {roleOrder.map((roleId) => {
                const config = roleConfigs[roleId];
                const owned = roleIds.includes(roleId);
                const active = account.activeRoleId === roleId;
                return (
                  <button
                    className={active ? 'role-chip active' : owned ? 'role-chip added' : 'role-chip'}
                    type="button"
                    key={roleId}
                    onClick={() => selectRole(roleId)}
                    style={{ ['--role' as string]: config.theme }}
                  >
                    {active ? <Crown size={17} /> : owned ? <ShieldCheck size={17} /> : <Plus size={17} />}
                    {active ? `${config.label} aktif` : owned ? `Buka ${config.label}` : `Daftar ${config.label}`}
                  </button>
                );
              })}
            </div>
            {(switchRoleId || registerRoleId) && (
              <div className="role-pin-panel">
                <p className="small-label">{switchRoleId ? 'Unlock role' : 'Daftar role'}</p>
                <h3>{roleConfigs[(switchRoleId || registerRoleId) as RoleId].label}</h3>
                {registerRoleId && (
                  <label>
                    Koloni role
                    <select value={roleKoloniCode} onChange={(event) => setRoleKoloniCode(event.target.value)}>
                      {joinableKoloni.map((node) => (
                        <option value={node.code} key={node.code}>{node.name}</option>
                      ))}
                    </select>
                  </label>
                )}
                <PinPad
                  value={rolePin}
                  onChange={(next) => { setRoleMessage(''); setRolePin(next); }}
                  onSubmit={switchRoleId ? submitSwitchRole : submitRegisterRole}
                  submitLabel={switchRoleId ? 'Buka role' : roleSubmitting ? 'Mendaftarkan...' : 'Daftar role ke Odoo'}
                  disabled={Boolean(registerRoleId && (rolePin.length !== 4 || roleSubmitting))}
                />
                {roleMessage && <p className="muted" style={{ margin: '10px 0 0' }}>{roleMessage}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
