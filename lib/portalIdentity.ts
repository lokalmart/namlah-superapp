export const portalLoginDomain = 'portal.namlah.local';

export function cleanSemutId(value: string) {
  return String(value || 'semut')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'semut';
}

export function makePortalLogin(semutId: string) {
  return `${cleanSemutId(semutId)}@${portalLoginDomain}`;
}

export function makePartnerExternalId(semutId: string) {
  return `namlah_partner.${cleanSemutId(semutId)}`;
}

export function makePortalUserExternalId(semutId: string) {
  return `namlah_portal.${cleanSemutId(semutId)}`;
}

export function makePortalIdentity(semutId: string) {
  return {
    portalLogin: makePortalLogin(semutId),
    partnerExternalId: makePartnerExternalId(semutId),
    userExternalId: makePortalUserExternalId(semutId),
    portalStatus: 'portal_ready' as const,
    emailRequired: false,
    emailVerificationStatus: 'not_required' as const,
  };
}
