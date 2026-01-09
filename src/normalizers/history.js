// https://docs.joinmastodon.org/entities/history/
import { asPlain } from "../utils/immutableSafe";

export const HistoryRecord = {
  accounts: [],
  day: "",
  uses: 0,
};

export const normalizeHistory = (history) => {
  const h = asPlain(history) || {};
  const out = {
    accounts: Array.isArray(h.accounts)
      ? h.accounts.map(asPlain)
      : (h.accounts ?? HistoryRecord.accounts),
    day: h.day ?? HistoryRecord.day,
    uses:
      typeof h.uses === "number"
        ? h.uses
        : h.uses
          ? Number(h.uses) || 0
          : HistoryRecord.uses,
  };
  return Object.freeze(out);
};
