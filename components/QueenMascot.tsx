import type { AppTab, RoleConfig } from '../lib/types';

type QueenMascotProps = {
  role: RoleConfig;
  activeTab: AppTab;
};

const tabCopy: Record<AppTab, string> = {
  map: 'Sarang berubah mengikuti role aktif.',
  store: 'Gudang Semut masih dummy untuk showcase.',
  scan: 'Scan Jejak disiapkan untuk barcode dan Web3 nanti.',
  account: 'Tambah Role-ID untuk melihat wajah app berubah.',
};

export function QueenMascot({ role, activeTab }: QueenMascotProps) {
  return (
    <aside className="queen" aria-label="Maskot ratu semut">
      <img src="/mascot/queen-ant.svg" alt="Maskot ratu semut Namlah" />
      <div className="queen-bubble">{tabCopy[activeTab]} Mode sekarang: {role.label}.</div>
    </aside>
  );
}
