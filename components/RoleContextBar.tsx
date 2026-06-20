import { Crown, Database, MapPinned, Plus, Settings, ShieldCheck, Workflow } from 'lucide-react';
import { getKoloniNode } from '../lib/koloni';
import { roleConfigs, roleOrder } from '../lib/mockData';
import { getSourceOfTruth } from '../lib/odooArchitecture';
import { activateRole, getActiveRoleAssignment, getRoleIds } from '../lib/storage';
import type { AppTab, RoleConfig, SemutAccount } from '../lib/types';

type RoleContextBarProps = {
  account: SemutAccount;
  role: RoleConfig;
  activeTab: AppTab;
  onAccountChange: (account: SemutAccount) => void;
  onTabChange: (tab: AppTab) => void;
};

export function RoleContextBar({ account, role, activeTab, onAccountChange, onTabChange }: RoleContextBarProps) {
  const assignment = getActiveRoleAssignment(account);
  const koloni = getKoloniNode(assignment?.koloniCode);
  const ownedRoles = getRoleIds(account);
  const source = getSourceOfTruth(role.id);

  function selectRole(roleId: typeof roleOrder[number]) {
    if (account.activeRoleId === roleId) return;
    if (!ownedRoles.includes(roleId)) {
      onTabChange('account');
      return;
    }
    onAccountChange(activateRole(account, roleId));
  }

  return (
    <header className="role-context-dock" aria-label="Konteks role aktif">
      <section className="context-summary">
        <span className="context-kicker"><MapPinned size={14} /> Posisi kerja</span>
        <strong>{role.label}</strong>
        <p>{koloni.name}</p>
      </section>

      <section className="context-stage">
        <span><Workflow size={14} /> Tahap</span>
        <strong>{source.stage}</strong>
        <p>{source.sop.nextActionLabel}</p>
      </section>

      <section className="context-stage context-source">
        <span><Database size={14} /> Source</span>
        <strong>{source.model}</strong>
        <p>{source.linkedRecord}</p>
      </section>

      <section className="role-switcher" aria-label="Pilih role">
        {roleOrder.map((roleId) => {
          const config = roleConfigs[roleId];
          const active = account.activeRoleId === roleId;
          const owned = ownedRoles.includes(roleId);
          return (
            <button
              type="button"
              className={active ? 'quick-role active' : owned ? 'quick-role owned' : 'quick-role'}
              key={roleId}
              onClick={() => selectRole(roleId)}
              style={{ ['--role-chip' as string]: config.theme }}
              aria-current={active ? 'page' : undefined}
              title={owned ? `Buka ${config.label}` : `Daftar ${config.label}`}
            >
              {active ? <Crown size={15} /> : owned ? <ShieldCheck size={15} /> : <Plus size={15} />}
              <span>{config.label}</span>
            </button>
          );
        })}
        <button type="button" className="quick-role manage" onClick={() => onTabChange('account')} title="Kelola role dan akun">
          <Settings size={15} />
          <span>Kelola</span>
        </button>
      </section>
    </header>
  );
}
