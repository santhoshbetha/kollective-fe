export const AdminReportRecord = {
  account: null,
  action_taken: false,
  action_taken_by_account: null,
  assigned_account: null,
  category: '',
  comment: '',
  created_at: new Date(),
  id: '',
  rules: [],
  statuses: [],
  target_account: null,
  updated_at: new Date(),
};
import { asPlain } from "../utils/immutableSafe";

const normalizePleromaReport = (src) => {
  if (!src) return src;
  if (src.actor) {
    return {
      ...src,
      target_account: src.account ?? null,
      account: src.actor ?? null,
      action_taken: (src.state != null ? src.state !== 'open' : src.action_taken) || false,
      comment: src.content ?? src.comment ?? '',
      updated_at: src.created_at ?? src.updated_at,
    };
  }
  return src;
};

export const normalizeAdminReport = (report) => {
  const src = asPlain(report) || {};
  const p = normalizePleromaReport(src);

  const out = {
    ...AdminReportRecord,
    ...p,
    account: p.account ?? null,
    action_taken: !!p.action_taken,
    action_taken_by_account: p.action_taken_by_account ?? null,
    assigned_account: p.assigned_account ?? null,
    category: p.category ?? '',
    comment: p.comment ?? '',
    created_at: p.created_at ?? AdminReportRecord.created_at,
    id: p.id != null ? String(p.id) : '',
    rules: Array.isArray(p.rules) ? p.rules.slice() : [],
    statuses: Array.isArray(p.statuses) ? p.statuses.slice() : [],
    target_account: p.target_account ?? null,
    updated_at: p.updated_at ?? AdminReportRecord.updated_at,
  };

  return Object.freeze(out);
};

export default normalizeAdminReport;
