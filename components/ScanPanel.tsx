import { BadgeCheck, ScanBarcode, Shield, Sparkles } from 'lucide-react';
import type { RoleConfig, SemutAccount } from '../lib/types';

type ScanPanelProps = {
  account: SemutAccount;
  role: RoleConfig;
};

export function ScanPanel({ account, role }: ScanPanelProps) {
  return (
    <section className="screen-panel">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Scan Jejak</p>
          <h2>{role.scanMode}</h2>
        </div>
        <span className="role-badge"><ScanBarcode size={17} /> {role.label}</span>
      </header>
      <div className="scan-layout">
        <div className={account.experienceTheme === 'game' ? 'scan-window game-scan' : 'scan-window'} aria-label="Dummy scan frame">
          {account.experienceTheme === 'game' && <div className="portal-ring" />}
          <div className="scan-frame" />
        </div>
        <aside className="scan-panel">
          <div className="account-card">
            <h3><BadgeCheck size={18} /> {role.primaryModule}</h3>
            <p className="muted">NMLH-{account.activeRoleId.toUpperCase()}-2026-0007</p>
          </div>
          <div className="account-card">
            <h3><Shield size={18} /> Status quest</h3>
            <p className="muted">{role.scanMode}. Web3 proof tetap dummy sampai backend disiapkan.</p>
          </div>
          <div className="role-menu-row scan-actions">
            {role.featuredActions.map((action) => (
              <button type="button" className="role-menu-card" key={action}>
                <strong>{action}</strong>
                <span>aksi role {role.label}</span>
              </button>
            ))}
          </div>
          <button className="primary-action" type="button">
            <Sparkles size={18} />
            {account.experienceTheme === 'game' ? 'Aktifkan Portal Scan' : 'Simulasikan Scan'}
          </button>
        </aside>
      </div>
    </section>
  );
}
