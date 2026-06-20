import { Crown, Map, ScanBarcode, Store, UserRound, type LucideIcon } from 'lucide-react';
import type { AppTab, RoleId } from '../lib/types';

type BottomNavProps = {
  activeTab: AppTab;
  activeRoleId: RoleId;
  onTabChange: (tab: AppTab) => void;
};

export const baseTabs: Array<{ id: AppTab; label: string; icon: LucideIcon }> = [
  { id: 'map', label: 'Map', icon: Map },
  { id: 'store', label: 'Gudang', icon: Store },
  { id: 'scan', label: 'Scan', icon: ScanBarcode },
  { id: 'account', label: 'Akun', icon: UserRound },
];

export function getAllowedTabs(activeRoleId: RoleId): Array<{ id: AppTab; label: string; icon: LucideIcon }> {
  const roleTabs: Partial<Record<RoleId, Array<{ id: AppTab; label: string; icon: LucideIcon }>>> = {
    member: [
      { id: 'map', label: 'Koloni', icon: Map },
      { id: 'store', label: 'Belanja', icon: Store },
      { id: 'scan', label: 'Bukti', icon: ScanBarcode },
      { id: 'account', label: 'Akun', icon: UserRound },
    ],
    surveyor: [
      { id: 'map', label: 'Lokasi', icon: Map },
      { id: 'store', label: 'Survey', icon: Store },
      { id: 'scan', label: 'Bukti', icon: ScanBarcode },
      { id: 'account', label: 'Akun', icon: UserRound },
    ],
    kurir: [
      { id: 'map', label: 'Rute', icon: Map },
      { id: 'store', label: 'Paket', icon: Store },
      { id: 'scan', label: 'Proof', icon: ScanBarcode },
      { id: 'account', label: 'Akun', icon: UserRound },
    ],
    kasir: [
      { id: 'map', label: 'Pos', icon: Map },
      { id: 'store', label: 'POS', icon: Store },
      { id: 'scan', label: 'Scan', icon: ScanBarcode },
      { id: 'account', label: 'Akun', icon: UserRound },
    ],
    umkm: [
      { id: 'map', label: 'Usaha', icon: Map },
      { id: 'store', label: 'Produk', icon: Store },
      { id: 'scan', label: 'Bukti', icon: ScanBarcode },
      { id: 'account', label: 'Akun', icon: UserRound },
    ],
    admin: [
      { id: 'map', label: 'Koloni', icon: Map },
      { id: 'ratu', label: 'Ratu', icon: Crown },
      { id: 'scan', label: 'Audit', icon: ScanBarcode },
      { id: 'account', label: 'Akun', icon: UserRound },
    ],
    koperasi: [
      { id: 'map', label: 'Koloni', icon: Map },
      { id: 'store', label: 'Program', icon: Store },
      { id: 'scan', label: 'Bukti', icon: ScanBarcode },
      { id: 'account', label: 'Akun', icon: UserRound },
    ],
  };
  return roleTabs[activeRoleId] || baseTabs;
}

export function BottomNav({ activeTab, activeRoleId, onTabChange }: BottomNavProps) {
  const tabs = getAllowedTabs(activeRoleId);
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button className={activeTab === id ? 'bottom-tab active' : 'bottom-tab'} type="button" onClick={() => onTabChange(id)} key={id}>
          <Icon size={20} />
          {label}
        </button>
      ))}
    </nav>
  );
}
