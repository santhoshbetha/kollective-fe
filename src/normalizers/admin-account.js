export const AdminAccountRecord = {
  account: null,
  approved: false,
  confirmed: false,
  created_at: new Date(),
  disabled: false,
  domain: '',
  email: '',
  id: '',
  invite_request: null,
  ip: null,
  ips: [],
  locale: null,
  role: null,
  sensitized: false,
  silenced: false,
  suspended: false,
  username: '',
};
import { asPlain } from "../utils/immutableSafe";

const normalizePleromaAccount = (acct) => {
  const a = asPlain(acct) || {};
  // If this payload is wrapped (has top-level 'account'), skip pleroma mapping
  if (a.account) return a;

  const isAdmin = !!(a.roles && a.roles.admin);
  const isModerator = a.roles && a.roles.moderator ? 'moderator' : null;
  const accountRole = isAdmin ? 'admin' : isModerator;

  return {
    ...a,
    approved: a.is_approved ?? a.approved ?? false,
    confirmed: a.is_confirmed ?? a.confirmed ?? false,
    disabled: a.is_active != null ? !a.is_active : a.disabled ?? false,
    invite_request: a.registration_reason ?? a.invite_request ?? null,
    role: accountRole ?? a.role,
  };
};

export const normalizeAdminAccount = (account) => {
  const src = asPlain(account) || {};
  const p = normalizePleromaAccount(src);

  const out = {
    ...AdminAccountRecord,
    ...p,
    account: p.account ?? p.account ?? null,
    approved: !!p.approved,
    confirmed: !!p.confirmed,
    created_at: p.created_at ?? AdminAccountRecord.created_at,
    disabled: !!p.disabled,
    domain: p.domain ?? '',
    email: p.email ?? '',
    id: p.id != null ? String(p.id) : '',
    invite_request: p.invite_request ?? null,
    ip: p.ip ?? null,
    ips: Array.isArray(p.ips) ? p.ips.slice() : [],
    locale: p.locale ?? null,
    role: p.role ?? null,
    sensitized: !!p.sensitized,
    silenced: !!p.silenced,
    suspended: !!p.suspended,
    username: p.username ?? '',
  };

  return Object.freeze(out);
};

export default normalizeAdminAccount;
