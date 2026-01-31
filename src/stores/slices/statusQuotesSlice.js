// Action-only slice for fetching/expanding quotes of a status.
// No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

const noOp = () => new Promise(f => f(null));

export function createStatusQuotesSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  return {
    // Fetch the first page of quotes for a given status
    async fetchStatusQuotes(statusId) {
      if (!statusId) return null;
      const actions = getActions();
      
      if (!isLoggedIn(actions)) return null;

      const key = `quotes:${statusId}`;
      const listState = actions.[key];

      // Avoid duplicate loads
      if (listState?.isLoading) return null;

      actions.fetchOrExpandStatusQuotesRequest?.(statusId);

      try {
        const res = await fetch(`/api/v1/statuses/${statusId}/quotes`);
        if (!res.ok) throw new Error(`Failed to fetch quotes (${res.status})`);
        
        const data = await res.json();
        const next = typeof res.next === "function" ? res.next() : null;

        // Coordinate entities and list state
        actions.importFetchedStatuses?.(data || []);
        actions.fetchStatusQuotesSuccess?.(statusId, data || [], next);
        
        return data;
      } catch (err) {
        actions.fetchOrExpandStatusQuotesFail?.(statusId);
        console.error("statusQuotesSlice.fetchStatusQuotes failed", err);
        return null;
      }
    },

    // Expand paginated quotes for a status
    async expandStatusQuotes(statusId) {
      if (!statusId) return null;
      const actions = getActions();
      
      if (!isLoggedIn(actions)) return null;

      const key = `quotes:${statusId}`;
      const listState = actions.[key];
      const url = listState?.next;

      if (!url || listState?.isLoading) return null;

      actions.fetchOrExpandStatusQuotesRequest?.(statusId);

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to expand quotes (${res.status})`);
        
        const data = await res.json();
        const next = typeof res.next === "function" ? res.next() : null;

        actions.importFetchedStatuses?.(data || []);
        actions.expandStatusQuotesSuccess?.(statusId, data || [], next);
        
        return data;
      } catch (err) {
        actions.fetchOrExpandStatusQuotesFail?.(statusId);
        console.error("statusQuotesSlice.expandStatusQuotes failed", err);
        return null;
      }
    },
  };
}

export default createStatusQuotesSlice;
