
// https://docs.joinmastodon.org/entities/list/
// Normalizer: accept Immutable-like inputs (has toJS/toObject) or plain JS,
// and return a frozen plain JavaScript object matching the internal record.
import { asPlain } from "../utils/immutableSafe";

export const ListRecord = {
  id: '',
  title: '',
  replies_policy: null,
};

export const normalizeList = (input) => {
  const src = asPlain(input) || {};
  const merged = { ...ListRecord, ...(src || {}) };

  const out = {
    id: merged.id != null ? String(merged.id) : '',
    title: merged.title != null ? String(merged.title) : '',
    replies_policy: merged.replies_policy == null ? null : merged.replies_policy,
  };

  return Object.freeze(out);
};

export default normalizeList;
