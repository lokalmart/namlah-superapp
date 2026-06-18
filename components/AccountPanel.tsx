import { LogOut, Plus, ShieldCheck, UserRoundCog } from 'lucide-react';
import { roleConfigs, roleOrder } from '../lib/mockData';
import { addRole, clearAccount } from '../lib/storage';
import type { RoleConfig, RoleId, SemutAccount } from '../lib/types';

type AccountPanelProps = {
  account: SemutAccount;
  role: RoleConfig;
  onChange: (account: SemutAccount) => void;
  onLogout: () => void;
};

export function AccountPanel({ account, role, onChange, onLogout }: AccountPanelProps) {
  function selectRole(roleId: RoleId) {
    if (!account.roles.includes(roleId)) return;
    onChange({ ...account, activeRoleId: roleId });
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
          <h2>Semut-ID dan Role-ID.</h2>
        </div>
        <span className="role-badge"><UserRoundCog size={17} /> {role.label}</span>
      </header>

      <div className="screen-scroll">
        <div className="account-layout">
          <aside className="account-card">
            <p className="small-label">Semut-ID</p>
            <h3>{account.displayName}</h3>
            <p className="muted">{account.semutId}</p>
            <button className="icon-action" type="button" onClick={onLogout}>
              <LogOut size={17} />
              Kunci App
            </button>
            <button className="icon-action" type="button" onClick={resetDemo} style={{ marginTop: 10 }}>
              <ShieldCheck size={17} />
              Reset Demo
            </button>
          </aside>

          <div className="account-card">
            <p className="small-label">Role-ID aktif</p>
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
                    {owned ? <ShieldCheck size={17} /> : <Plus size={17} />}
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
