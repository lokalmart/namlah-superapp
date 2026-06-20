import { roleConfigs } from './roleConfig';
import { defaultKoloniCode, defaultWilayahCode, getKoloniNode } from './koloni';
import { makePortalIdentity } from './portalIdentity';
import type { ExperienceTheme, RoleAssignment, RoleId, SemutAccount } from './types';

const ACCOUNT_KEY = 'namlah_superapp_semut_account';

export function createPinHashLocal(pin: string) {
  return window.btoa(`${pin.split('').reverse().join('')}:namlah-local-session`);
}

export function verifyPinLocal(pin: string, hash: string) {
  return createPinHashLocal(pin) === hash;
}

export function verifyRolePinLocal(pin: string, assignment?: RoleAssignment) {
  if (!assignment || assignment.status !== 'active') return false;
  return verifyPinLocal(pin, assignment.rolePinHashLocal);
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
    const parsed = JSON.parse(raw) as SemutAccount & { roles?: RoleId[] };
    if (!parsed.semutId || !parsed.pinHashLocal) return null;
    const restoredRoleIds: RoleId[] = parsed.roles?.length ? parsed.roles : ['member'];
    const roleAssignments = parsed.roleAssignments?.length
      ? parsed.roleAssignments
      : restoredRoleIds.map((roleId) => makeRoleAssignment(roleId, parsed.pinHashLocal));
    const cleanAssignments = roleAssignments
      .filter((assignment) => roleConfigs[assignment.roleId])
      .filter((assignment) => assignment.rolePinHashLocal)
      .map((assignment) => ({
        ...assignment,
        status: assignment.status || 'active',
        koloniCode: getKoloniNode(assignment.koloniCode).code,
        wilayahCode: getKoloniNode(assignment.koloniCode).wilayahCode,
        registeredAt: assignment.registeredAt || '2026-06-19T00:00:00+07:00',
      }));
    const activeRoleId = cleanAssignments.some((assignment) => assignment.roleId === parsed.activeRoleId)
      ? parsed.activeRoleId
      : cleanAssignments[0]?.roleId || 'member';
    const portal = makePortalIdentity(parsed.semutId);
    return {
      ...parsed,
      portalLogin: parsed.portalLogin || portal.portalLogin,
      portalStatus: parsed.portalStatus || portal.portalStatus,
      emailVerificationStatus: parsed.emailVerificationStatus || portal.emailVerificationStatus,
      roleAssignments: cleanAssignments.length ? cleanAssignments : [makeRoleAssignment('member', parsed.pinHashLocal)],
      activeRoleId,
      experienceTheme: parsed.experienceTheme || 'game',
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

export function makeRoleAssignment(roleId: RoleId, rolePinHashLocal: string, koloniCode = defaultKoloniCode): RoleAssignment {
  const koloni = getKoloniNode(koloniCode);
  return {
    roleId,
    rolePinHashLocal,
    status: 'active',
    koloniCode: koloni.code,
    wilayahCode: koloni.wilayahCode || defaultWilayahCode,
    registeredAt: new Date().toISOString(),
  };
}

export function getRoleAssignments(account: SemutAccount) {
  return account.roleAssignments || [];
}

export function getRoleIds(account: SemutAccount): RoleId[] {
  return getRoleAssignments(account).map((assignment) => assignment.roleId);
}

export function getActiveRoleAssignment(account: SemutAccount) {
  return getRoleAssignments(account).find((assignment) => assignment.roleId === account.activeRoleId);
}

export function getRoleAssignment(account: SemutAccount, roleId: RoleId) {
  return getRoleAssignments(account).find((assignment) => assignment.roleId === roleId);
}

export function registerRole(account: SemutAccount, roleId: RoleId, pin: string, koloniCode = defaultKoloniCode): SemutAccount {
  const rolePinHashLocal = createPinHashLocal(pin);
  const nextAssignment = makeRoleAssignment(roleId, rolePinHashLocal, koloniCode);
  const assignments = getRoleAssignments(account).filter((assignment) => assignment.roleId !== roleId);
  return {
    ...account,
    roleAssignments: [...assignments, nextAssignment],
    activeRoleId: roleId,
  };
}

export function activateRole(account: SemutAccount, roleId: RoleId): SemutAccount {
  if (!getRoleAssignment(account, roleId)) return account;
  return { ...account, activeRoleId: roleId };
}

export function setExperienceTheme(account: SemutAccount, experienceTheme: ExperienceTheme): SemutAccount {
  return { ...account, experienceTheme };
}
