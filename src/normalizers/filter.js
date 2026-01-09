/**
 * Filter normalizer:
 * Converts API filters into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/filter/}
 */
import { normalizeFilterKeyword } from "./filter-keyword.js";
import { normalizeFilterStatus } from "./filter-status.js";

// https://docs.joinmastodon.org/entities/filter/
export const FilterRecord = {
  id: "",
  title: "",
  context: [],
  expires_at: "",
  filter_action: "warn",
  keywords: [],
  statuses: [],
};

import { asPlain } from "../utils/immutableSafe";

const normalizeKeywordEntry = (kw) => {
  if (!kw) return null;
  const k = asPlain(kw);
  if (typeof k === "string")
    return normalizeFilterKeyword({ keyword: k, whole_word: false });
  return normalizeFilterKeyword(k);
};

const normalizeStatusEntry = (st) => {
  if (!st) return null;
  return normalizeFilterStatus(asPlain(st));
};

export const normalizeFilter = (filterInput) => {
  if (!filterInput) return null;

  const f = asPlain(filterInput) || {};

  // v1 compatibility: older API returned `phrase` + `whole_word` + `irreversible`
  const isV1 = f.phrase != null;

  const id = f.id ?? f._id ?? "";
  const title = isV1 ? String(f.phrase) : (f.title ?? "");
  const context = Array.isArray(f.context)
    ? f.context.slice()
    : f.context
      ? [f.context]
      : [];
  const expires_at = f.expires_at ?? f.expiresAt ?? "";
  const filter_action = isV1
    ? f.irreversible
      ? "hide"
      : "warn"
    : (f.filter_action ?? "warn");

  // keywords: v1 => single phrase mapped to a keyword entry
  let rawKeywords = [];
  if (isV1) {
    rawKeywords = [{ keyword: f.phrase, whole_word: !!f.whole_word }];
  } else if (Array.isArray(f.keywords)) rawKeywords = f.keywords.slice();

  const keywords = rawKeywords.map(normalizeKeywordEntry).filter(Boolean);

  let rawStatuses = Array.isArray(f.statuses) ? f.statuses.slice() : [];
  const statuses = rawStatuses.map(normalizeStatusEntry).filter(Boolean);

  const out = {
    id: id || "",
    title: title || "",
    context: context || [],
    expires_at: expires_at || "",
    filter_action: filter_action || "warn",
    keywords,
    statuses,
  };

  try {
    return Object.freeze(out);
  } catch {
    return out;
  }
};
