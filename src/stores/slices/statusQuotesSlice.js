// Action-only slice for fetching/expanding quotes of a status.
// No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

const noOp = () => new Promise(f => f(null));

export function createStatusQuotesSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    // Fetch the first page of quotes for a given status
    async fetchStatusQuotes(statusId) {
      if (!statusId) return null;
      const root = rootGet();
      if (!isLoggedIn(root)) return null;

      // avoid duplicate loads
      if (root.statusLists?.[`quotes:${statusId}`]?.isLoading) {
        return noOp();
      }

      if (typeof root.statusLists.fetchOrExpandStatusQuotesRequest === "function") {
        root.statusLists.fetchOrExpandStatusQuotesRequest(statusId);
      }

      try {
        const res = await fetch(`/api/v1/statuses/${statusId}/quotes`, { method: "GET" });
        if (!res.ok) throw new Error(`Failed to fetch status quotes (${res.status})`);
        const data = await res.json();
        const next = typeof res.next === "function" ? res.next() : null;

        root.importer?.importFetchedStatuses?.(data || []);
        if (typeof root.statusLists.fetchStatusQuotesSuccess === "function") {
          root.statusLists.fetchStatusQuotesSuccess(statusId, data || [], next);
        }
        return data;
      } catch (err) {
        if (typeof root.statusLists.fetchStatusQuotesFail === "function") {
          root.statusLists.fetchStatusQuotesFail(statusId);
        }
        console.error("statusQuotesSlice.fetchStatusQuotes failed", err);
        return null;
      }
    },

    // Expand paginated quotes for a status (uses statusLists[`quotes:${statusId}`].next)
    async expandStatusQuotes(statusId) {
      if (!statusId) return null;
      const root = rootGet();
      if (!isLoggedIn(root)) return null;

      const key = `quotes:${statusId}`;
      const url = root.statusLists?.[key]?.next || null;
      if (url === null || root.statusLists?.[key]?.isLoading) return;

      if (typeof root.statusLists.fetchOrExpandStatusQuotesRequest === "function") {
        root.statusLists.fetchOrExpandStatusQuotesRequest(statusId);
      }

      try {
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) throw new Error(`Failed to expand status quotes (${res.status})`);
        const data = await res.json();
        const next = typeof res.next === "function" ? res.next() : null;

        root.importer?.importFetchedStatuses?.(data || []);
        if (typeof root.statusLists.expandStatusQuotesSuccess === "function") {
          root.statusLists.expandStatusQuotesSuccess(statusId, data || [], next);
        }
        return data;
      } catch (err) {
        if (typeof root.statusLists.fetchOrExpandStatusQuotesFail === "function") {
          root.statusLists.fetchOrExpandStatusQuotesFail(statusId);
        }
        console.error("statusQuotesSlice.expandStatusQuotes failed", err);
        return null;
      }
    },
  };
}

export default createStatusQuotesSlice;
