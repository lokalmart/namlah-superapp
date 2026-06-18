import { roleConfigs } from './mockData';
import type { RoleId, SemutAccount } from './types';

const ACCOUNT_KEY = 'namlah_superapp_semut_account';

export function createPinHashDemo(pin: string) {
  return window.btoa(`${pin.split('').reverse().join('')}:namlah-demo`);
}

export function verifyPinDemo(pin: string, hash: string) {
  return createPinHashDemo(pin) === hash;
}

export function makeSemutId(name: string) {
  const clean = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'SEMUT';
  return `SMT-${clean}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function loadAccount(): SemutAccount | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ACCOUNT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SemutAccount;
    if (!parsed.semutId || !parsed.pinHashDemo) return null;
    return {
      ...parsed,
      roles: parsed.roles?.length ? parsed.roles : ['member'],
      activeRoleId: roleConfigs[parsed.activeRoleId] ? parsed.activeRoleId : 'member',
    };
  } catch {
    return null;
  }
}

export function saveAccount(account: SemutAccount) {
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}

export function clearAccount() {
  window.localStorage.removeItem(ACCOUNT_KEY);
}

export function addRole(account: SemutAccount, roleId: RoleId): SemutAccount {
  if (account.roles.includes(roleId)) return { ...account, activeRoleId: roleId };
  return { ...account, roles: [...account.roles, roleId], activeRoleId: roleId };
}
