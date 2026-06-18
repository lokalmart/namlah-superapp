import { Map, ScanBarcode, Store, UserRound } from 'lucide-react';
import type { AppTab } from '../lib/types';

type BottomNavProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

const tabs: Array<{ id: AppTab; label: string; icon: typeof Map }> = [
  { id: 'map', label: 'Map', icon: Map },
  { id: 'store', label: 'Gudang', icon: Store },
  { id: 'scan', label: 'Scan', icon: ScanBarcode },
  { id: 'account', label: 'Akun', icon: UserRound },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
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
