// https://docs.joinmastodon.org/entities/FilterKeyword/
export const FilterKeywordRecord = {
  id: "",
  keyword: "",
  whole_word: false,
};

import { asPlain } from "../utils/immutableSafe";

export const normalizeFilterKeyword = (filterKeyword) => {
  if (!filterKeyword) return null;
  const fk = asPlain(filterKeyword);

  // If a plain string was passed, treat it as the keyword
  if (typeof fk === "string") {
    const out = { id: "", keyword: fk, whole_word: false };
    try {
      return Object.freeze(out);
    } catch {
      return out;
    }
  }

  const id = fk.id ?? fk._id ?? "";
  const keyword = fk.keyword ?? fk.phrase ?? "";
  const whole_word = fk.whole_word ?? fk.wholeWord ?? false;

  const out = {
    id: id || "",
    keyword: String(keyword || ""),
    whole_word: !!whole_word,
  };
  try {
    return Object.freeze(out);
  } catch {
    return out;
  }
};
