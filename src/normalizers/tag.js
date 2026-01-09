import { normalizeHistory } from "./history";
import { asPlain } from "../utils/immutableSafe";

// https://docs.joinmastodon.org/entities/tag/

export const TagRecord = {
  name: "",
  url: "",
  history: null,
  following: false,
};

const normalizeHistoryList = (rawHistory) => {
  if (!rawHistory) return null;
  const arr = asPlain(rawHistory);
  if (!Array.isArray(arr)) return null;
  return arr.map((h) => normalizeHistory(h));
};

export const normalizeTag = (tag) => {
  const t = asPlain(tag) || {};
  const out = {
    name: t.name ?? TagRecord.name,
    url: t.url ?? TagRecord.url,
    history: normalizeHistoryList(t.history),
    following: Boolean(t.following ?? TagRecord.following),
  };
  return Object.freeze(out);
};
