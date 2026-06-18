import { BadgeCheck, ScanBarcode, Shield, Sparkles } from 'lucide-react';
import type { RoleConfig } from '../lib/types';

type ScanPanelProps = {
  role: RoleConfig;
};

export function ScanPanel({ role }: ScanPanelProps) {
  return (
    <section className="screen-panel">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Scan Jejak</p>
          <h2>Portal scan untuk jejak barang dan aktivitas.</h2>
        </div>
        <span className="role-badge"><ScanBarcode size={17} /> {role.label}</span>
      </header>
      <div className="scan-layout">
        <div className="scan-window" aria-label="Dummy scan frame">
          <div className="portal-ring" />
          <div className="scan-frame" />
        </div>
        <aside className="scan-panel">
          <div className="account-card">
            <h3><BadgeCheck size={18} /> Jejak dummy</h3>
            <p className="muted">NMLH-TRACE-2026-0007</p>
          </div>
          <div className="account-card">
            <h3><Shield size={18} /> Status quest</h3>
            <p className="muted">Siap menjadi pintu barcode, audit, dan Web3 proof setelah backend disiapkan.</p>
          </div>
          <button className="primary-action" type="button">
            <Sparkles size={18} />
            Aktifkan Portal Scan
          </button>
        </aside>
      </div>
    </section>
  );
}
