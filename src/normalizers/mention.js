// https://docs.joinmastodon.org/entities/mention/
export const MentionRecord = {
  id: "",
  acct: "",
  username: "",
  url: "",
};

import { asPlain } from "../utils/immutableSafe";

export const normalizeMention = (mention) => {
  const m = asPlain(mention) || {};
  return Object.freeze({
    ...MentionRecord,
    ...m,
    id: String(m.id || ""),
    acct: String(m.acct || ""),
    username: String(m.username || ""),
    url: String(m.url || ""),
  });
};
