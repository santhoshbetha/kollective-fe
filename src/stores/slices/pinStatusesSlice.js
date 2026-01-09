// Action-only slice to manage pinned statuses (fetch, expand, pin, unpin).
// No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

export function createPinStatusesSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    // Fetch pinned statuses (optionally for a specific account)
    async fetchPinnedStatuses() {
      const root = rootGet();
      if (!isLoggedIn(root)) return null;
      const id = root.auth.me;

      try {
        const url = id
          ? `/api/v1/accounts/${id}/statuses`
          : `/api/v1/pinned`;
        const res = await fetch(url + "?" + new URLSearchParams({ pinned: true } ), 
        { method: "GET" });
        if (!res.ok) throw new Error(`Failed to fetch pinned statuses (${res.status})`);
        const data = await res.json();

        root.importer?.importFetchedStatuses?.(data || []);
        root.statusLists?.fetchPinnedStatusesSuccess?.(data || [], null);
        return data;
      } catch (err) {
        console.error("pinStatusesSlice.fetchPinnedStatuses failed", err);
        return null;
      }
    },
  };
}

export default createPinStatusesSlice;
