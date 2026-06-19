import { Crown, Gamepad2, LogOut, Plus, ShieldCheck, Sparkles, UserRoundCog } from 'lucide-react';
import { roleConfigs, roleOrder } from '../lib/mockData';
import { getCustomFieldsByModel, makePortalActor } from '../lib/odooArchitecture';
import { addRole, clearAccount, setExperienceTheme } from '../lib/storage';
import type { ExperienceTheme, RoleConfig, RoleId, SemutAccount } from '../lib/types';

type AccountPanelProps = {
  account: SemutAccount;
  role: RoleConfig;
  onChange: (account: SemutAccount) => void;
  onLogout: () => void;
};

export function AccountPanel({ account, role, onChange, onLogout }: AccountPanelProps) {
  const actor = makePortalActor(account);
  const taskFields = getCustomFieldsByModel('project.task').slice(0, 5);
  const orderFields = getCustomFieldsByModel('sale.order').slice(0, 4);

  function selectRole(roleId: RoleId) {
    if (!account.roles.includes(roleId)) return;
    onChange({ ...account, activeRoleId: roleId });
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
                const owned = account.roles.includes(roleId);
                const active = account.activeRoleId === roleId;
                return (
                  <button
                    className={active ? 'role-chip active' : owned ? 'role-chip added' : 'role-chip'}
                    type="button"
                    key={roleId}
                    onClick={() => (owned ? selectRole(roleId) : onChange(addRole(account, roleId)))}
                    style={{ ['--role' as string]: config.theme }}
                  >
                    {active ? <Crown size={17} /> : owned ? <ShieldCheck size={17} /> : <Plus size={17} />}
                    {owned ? config.label : `Tambah ${config.label}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}