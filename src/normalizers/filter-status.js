// https://docs.joinmastodon.org/entities/FilterStatus/
export const FilterStatusRecord = {
  id: "",
  status_id: "",
};

import { asPlain } from "../utils/immutableSafe";

export const normalizeFilterStatus = (filterStatus) => {
  if (!filterStatus) return null;
  const fs = asPlain(filterStatus);

  // Accept a bare id string
  if (typeof fs === "string") {
    const out = { id: "", status_id: fs };
    try {
      return Object.freeze(out);
    } catch {
      return out;
    }
  }

  const id = fs.id ?? fs._id ?? "";
  const status_id = fs.status_id ?? fs.statusId ?? fs.id ?? "";

  const out = { id: id || "", status_id: String(status_id || "") };
  try {
    return Object.freeze(out);
  } catch {
    return out;
  }
};
