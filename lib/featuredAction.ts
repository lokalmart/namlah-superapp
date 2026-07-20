import { Coins, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import type { AppTab, RoleConfig } from './types';

type FeaturedAction = {
  label: string;
  targetTab: AppTab;
  icon: LucideIcon;
  title: string;
};

const roleFeaturedActions: Partial<Record<RoleConfig['id'], FeaturedAction>> = {
  kasir: { label: 'Buat Order', targetTab: 'store', icon: Coins, title: 'POS Kasir koloni' },
  kurir: { label: 'Ambil Pickup', targetTab: 'scan', icon: Truck, title: 'Ambil pickup kurir' },
  umkm: { label: 'Onboarding', targetTab: 'store', icon: PackageCheck, title: 'Onboarding UMKM' },
  member: { label: 'Belanja', targetTab: 'store', icon: ShoppingBag, title: 'Belanja koloni' },
};

export function getFeaturedAction(role: RoleConfig): FeaturedAction | null {
  return roleFeaturedActions[role.id] ?? null;
}
