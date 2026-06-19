import type { AppTab, RoleConfig } from '../lib/types';

type QueenMascotProps = {
  role: RoleConfig;
  activeTab: AppTab;
};

const tabCopy: Record<AppTab, string> = {
  map: 'Mode game aktif: sarang, jalur, dan misi ikut role.',
  store: 'Gudang Semut tampil seperti shop inventory.',
  ratu: 'Ratu Semut menampilkan misi, order, milestone, dan laporan.',
  scan: 'Scan Jejak jadi portal rune untuk barcode dan Web3 nanti.',
  account: 'Tambah Role-ID seperti membuka kelas karakter baru.',
};

export function QueenMascot({ role, activeTab }: QueenMascotProps) {
  return (
    <aside className="queen" aria-label="Maskot ratu semut">
      <img src="/mascot/queen-ant.svg" alt="Maskot ratu semut Namlah" />
      <div className="queen-bubble">{tabCopy[activeTab]} Mode sekarang: {role.label}.</div>
    </aside>
  );
}
