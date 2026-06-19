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
  if (activeRoleId === 'admin') {
    return [
      { id: 'map', label: 'Map', icon: Map },
      { id: 'ratu', label: 'Ratu Semut', icon: Crown },
      { id: 'scan', label: 'Scan', icon: ScanBarcode },
      { id: 'account', label: 'Akun', icon: UserRound },
    ];
  }
  return baseTabs;
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
