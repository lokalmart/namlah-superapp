import { Crown, Gamepad2, LogOut, Plus, ShieldCheck, Sparkles, UserRoundCog } from 'lucide-react';
import { useState } from 'react';
import { PinPad } from './PinPad';
import { koloniNodes } from '../lib/koloni';
import { roleConfigs, roleOrder } from '../lib/mockData';
import { getCustomFieldsByModel, makePortalActor } from '../lib/odooArchitecture';
import { activateRole, clearAccount, getActiveRoleAssignment, getRoleAssignment, getRoleIds, registerRole, setExperienceTheme, verifyRolePinDemo } from '../lib/storage';
import type { ExperienceTheme, RoleConfig, RoleId, SemutAccount } from '../lib/types';

type AccountPanelProps = {
  account: SemutAccount;
  role: RoleConfig;
  onChange: (account: SemutAccount) => void;
  onLogout: () => void;
};

export function AccountPanel({ account, role, onChange, onLogout }: AccountPanelProps) {
  const actor = makePortalActor(account);
  const roleIds = getRoleIds(account);
  const activeAssignment = getActiveRoleAssignment(account);
  const taskFields = getCustomFieldsByModel('project.task').slice(0, 5);
  const orderFields = getCustomFieldsByModel('sale.order').slice(0, 4);
  const [switchRoleId, setSwitchRoleId] = useState<RoleId | null>(null);
  const [registerRoleId, setRegisterRoleId] = useState<RoleId | null>(null);
  const [rolePin, setRolePin] = useState('');
  const [roleKoloniCode, setRoleKoloniCode] = useState(activeAssignment?.koloniCode || 'koloni_kejaksan_demo');
  const [roleMessage, setRoleMessage] = useState('');

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
    if (!verifyRolePinDemo(rolePin, assignment)) {
      setRoleMessage('PIN role belum cocok.');
      setRolePin('');
      return;
    }
    onChange(activateRole(account, switchRoleId));
    setSwitchRoleId(null);
    setRolePin('');
    setRoleMessage('');
  }

  function submitRegisterRole() {
    if (!registerRoleId || rolePin.length !== 4) return;
    onChange(registerRole(account, registerRoleId, rolePin, roleKoloniCode));
    setRegisterRoleId(null);
    setRolePin('');
    setRoleMessage('');
  }

  function selectTheme(experienceTheme: ExperienceTheme) {
    onChange(setExperienceTheme(account, experienceTheme));
  }

  function resetDemo() {
    clearAccount();
    onLogout();
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
          <aside className="account-card">
            <p className="small-label">Semut-ID</p>
            <h3>{account.displayName}</h3>
            <p className="muted">{account.semutId}</p>
            <div className="portal-map">
              <span>res.partner</span>
              <strong>{actor.partnerExternalId}</strong>
              <span>res.users portal</span>
              <strong>{actor.userExternalId}</strong>
              <span>tenant / sarang</span>
              <strong>{actor.tenantCode} / {actor.sarangCode}</strong>
              <span>role koloni</span>
              <strong>{activeAssignment?.koloniCode || '-'} / {activeAssignment?.wilayahCode || '-'}</strong>
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
            <button className="icon-action" type="button" onClick={resetDemo} style={{ marginTop: 10 }}>
              <ShieldCheck size={17} />
              Reset Demo
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
                      {koloniNodes.map((node) => (
                        <option value={node.code} key={node.code}>{node.name}</option>
                      ))}
                    </select>
                  </label>
                )}
                <PinPad
                  value={rolePin}
                  onChange={(next) => { setRoleMessage(''); setRolePin(next); }}
                  onSubmit={switchRoleId ? submitSwitchRole : submitRegisterRole}
                  submitLabel={switchRoleId ? 'Buka role' : 'Simpan PIN role'}
                  disabled={Boolean(registerRoleId && rolePin.length !== 4)}
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
