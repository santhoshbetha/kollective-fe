import { getFeatures } from "../../utils/features";

export function createTrendingStatusesSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  return {
    // --- Initial State ---
    items: new Set(),
    isLoading: false,
    next: null,

    fetchTrendingStatusesRequest() {
      setScoped((state) => {
        state.isLoading = true;
      });
    },

    fetchOrExpandTrendingStatusesSuccess(statuses, next) {
      setScoped((state) => {
        // Direct mutation of the Set draft via Immer
        (statuses || []).forEach((status) => {
          if (status?.id) state.items.add(status.id);
        });
        
        state.next = next || null;
        state.isLoading = false;
      });
    },

    async fetchTrendingStatuses() {
      const actions = getActions();
      const features = getFeatures();

      if (!features.trendingStatuses) return;

      actions.fetchTrendingStatusesRequest();

      try {
        const res = await fetch(`/api/v1/trends/statuses`);
        if (!res.ok) throw new Error(`Fetch trends failed: ${res.status}`);
        
        const data = await res.json();
        const next = data.next || null;

        // Coordinate with central importer
        actions.importFetchedStatuses?.(data || []);
        
        actions.fetchOrExpandTrendingStatusesSuccess(data, next);
      } catch (error) {
        console.error("TrendingStatuses.fetchTrendingStatuses failed", error);
        // Ensure loading state resets even on error
        setScoped((state) => { state.isLoading = false; });
      } 
    },

    async expandTrendingStatuses(path) {
      if (!path) return;
      const actions = getActions();

      try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Expand trends failed: ${res.status}`);
        
        const data = await res.json();
        const next = data.next || null;

        actions.importFetchedStatuses?.(data || []);
        
        actions.fetchOrExpandTrendingStatusesSuccess(data, next);
      } catch (error) {
        console.error("TrendingStatuses.expandTrendingStatuses failed", error);
      }
    }
  };
}
