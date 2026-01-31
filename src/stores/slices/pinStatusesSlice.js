// Action-only slice to manage pinned statuses (fetch, expand, pin, unpin).
// No local state — only actions.
import { isLoggedIn } from "../../utils/auth";

export function createPinStatusesSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  return {
    /**
     * Fetch pinned statuses. 
     * Uses the specific account ID if available, otherwise falls back to the generic pinned endpoint.
     */
    async fetchPinnedStatuses() {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      const myId = rootGet().auth.me;
      const params = new URLSearchParams({ pinned: 'true' });

      try {
        // Construct the URL based on whether we have the current user's ID
        const url = myId 
          ? `/api/v1/accounts/${myId}/statuses?${params}` 
          : `/api/v1/pinned?${params}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch pinned statuses (${res.status})`);
        
        const data = await res.json();

        // Coordinate entities with the importer and list manager
        actions.importFetchedStatuses?.(data || []);
        actions.fetchPinnedStatusesSuccess?.(data || [], null);
        
        return data;
      } catch (err) {
        console.error("pinStatusesSlice.fetchPinnedStatuses failed", err);
        return null;
      }
    },
  };
}

export default createPinStatusesSlice;
