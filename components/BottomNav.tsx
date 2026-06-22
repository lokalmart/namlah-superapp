import { Activity, Crown, Map, MessageCircle, ShoppingBasket, UserRound, type LucideIcon } from 'lucide-react';
import type { AppTab, RoleId } from '../lib/types';

type BottomNavProps = {
  activeTab: AppTab;
  activeRoleId: RoleId;
  onTabChange: (tab: AppTab) => void;
};

export const baseTabs: Array<{ id: AppTab; label: string; icon: LucideIcon }> = [
  { id: 'map', label: 'Peta', icon: Map },
  { id: 'store', label: 'Katalog', icon: ShoppingBasket },
  { id: 'forum', label: 'Forum', icon: MessageCircle },
  { id: 'scan', label: 'Aktivitas', icon: Activity },
  { id: 'account', label: 'Profil', icon: UserRound },
];

export function getAllowedTabs(activeRoleId: RoleId): Array<{ id: AppTab; label: string; icon: LucideIcon }> {
  const roleTabs: Partial<Record<RoleId, Array<{ id: AppTab; label: string; icon: LucideIcon }>>> = {
    member: [
      { id: 'map', label: 'Peta', icon: Map },
      { id: 'store', label: 'Katalog', icon: ShoppingBasket },
      { id: 'forum', label: 'Forum', icon: MessageCircle },
      { id: 'scan', label: 'Aktivitas', icon: Activity },
      { id: 'account', label: 'Profil', icon: UserRound },
    ],
    surveyor: [
      { id: 'map', label: 'Peta', icon: Map },
      { id: 'store', label: 'Katalog', icon: ShoppingBasket },
      { id: 'forum', label: 'Forum', icon: MessageCircle },
      { id: 'scan', label: 'Aktivitas', icon: Activity },
      { id: 'account', label: 'Profil', icon: UserRound },
    ],
    kurir: [
      { id: 'map', label: 'Peta', icon: Map },
      { id: 'store', label: 'Katalog', icon: ShoppingBasket },
      { id: 'forum', label: 'Forum', icon: MessageCircle },
      { id: 'scan', label: 'Aktivitas', icon: Activity },
      { id: 'account', label: 'Profil', icon: UserRound },
    ],
    kasir: [
      { id: 'map', label: 'Peta', icon: Map },
      { id: 'store', label: 'Katalog', icon: ShoppingBasket },
      { id: 'forum', label: 'Forum', icon: MessageCircle },
      { id: 'scan', label: 'Aktivitas', icon: Activity },
      { id: 'account', label: 'Profil', icon: UserRound },
    ],
    umkm: [
      { id: 'map', label: 'Peta', icon: Map },
      { id: 'store', label: 'Katalog', icon: ShoppingBasket },
      { id: 'forum', label: 'Forum', icon: MessageCircle },
      { id: 'scan', label: 'Aktivitas', icon: Activity },
      { id: 'account', label: 'Profil', icon: UserRound },
    ],
    admin: [
      { id: 'map', label: 'Peta', icon: Map },
      { id: 'store', label: 'Katalog', icon: ShoppingBasket },
      { id: 'forum', label: 'Forum', icon: MessageCircle },
      { id: 'ratu', label: 'Ratu', icon: Crown },
      { id: 'account', label: 'Profil', icon: UserRound },
    ],
    koperasi: [
      { id: 'map', label: 'Peta', icon: Map },
      { id: 'store', label: 'Katalog', icon: ShoppingBasket },
      { id: 'forum', label: 'Forum', icon: MessageCircle },
      { id: 'scan', label: 'Aktivitas', icon: Activity },
      { id: 'account', label: 'Profil', icon: UserRound },
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
