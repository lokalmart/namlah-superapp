import { BadgeCheck, Camera, MapPin, NotebookPen, ScanBarcode, Shield, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { getSourceOfTruth, makePortalActor } from '../lib/odooArchitecture';
import type { RoleConfig, SemutAccount } from '../lib/types';

type ScanPanelProps = {
  account: SemutAccount;
  role: RoleConfig;
};

export function ScanPanel({ account, role }: ScanPanelProps) {
  const actor = makePortalActor(account);
  const source = getSourceOfTruth(role.id);
  const [flash, setFlash] = useState(false);

  function simulateScan() {
    setFlash(true);
    setTimeout(() => setFlash(false), 420);
  }

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
          <div className={`scan-frame ${flash ? 'pin-flash' : ''}`} />
        </div>
        <aside className="scan-panel">
          <Card>
            <h3><BadgeCheck size={18} /> {role.primaryModule}</h3>
            <p className="muted">{source.model} / {source.saleOrder || source.task}</p>
          </Card>
          <Card variant="filled">
            <h3><Shield size={18} /> Bukti ke Odoo</h3>
            <p className="muted">Actor {actor.semutId} menulis {source.sop.requiredProof} ke {source.model}.</p>
            <div className="proof-chip-row">
              <span><Camera size={13} /> Foto</span>
              <span><MapPin size={13} /> Lokasi</span>
              <span><NotebookPen size={13} /> Catatan</span>
            </div>
          </Card>
          <Card variant="filled">
            <h3><Shield size={18} /> SOP stage: {source.stage}</h3>
            <p className="muted">{source.sop.mobileHint}</p>
          </Card>
          <div className="role-menu-row scan-actions">
            {role.featuredActions.map((action) => (
              <button type="button" className="role-menu-card" key={action}>
                <strong>{action}</strong>
                <span>aksi role {role.label}</span>
              </button>
            ))}
          </div>
          <Button
            fullWidth
            leading={<Sparkles size={18} />}
            onClick={simulateScan}
          >
            {account.experienceTheme === 'game' ? 'Aktifkan Portal Scan' : 'Simulasikan Scan'}
          </Button>
        </aside>
      </div>
    </section>
  );
}
