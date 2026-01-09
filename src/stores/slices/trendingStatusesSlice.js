import { getFeatures } from "../../utils/features";

export function createTrendingStatusesSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  // get not used
  return {
    items: new Set(),
    isLoading: false,
    next: null,

    fetchTrendingStatusesRequest() {
      set((state) => {
        state.isLoading = true;
      });
    },

    fetchOrExpandTrendingStatusesSuccess(statuses, next) {
      set((state) => {
        const existing = state.items || new Set();
        statuses.forEach((status) => {
          if (status && status.id) existing.add(status.id);
        });
        state.items = existing;
        state.next = next || null;
        state.isLoading = false;
      });
    },

    async fetchTrendingStatuses() {
      const root = rootGet();
      const features = getFeatures();

      if (!features.trendingStatuses) return;

      this.fetchTrendingStatusesRequest();

      try {
        const response = await fetch(`/api/v1/trends/statuses`, {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch trending statuses: ${response.status}`,
          );
        }
        const data = await response.json();
        const statuses = data;
        const next = data.next || null;

        root.importer?.importFetchedStatuses?.(statuses || []);

        this.fetchOrExpandTrendingStatusesSuccess(statuses, next);
      } catch (error) {
        console.error("Error fetching trending statuses:", error);
      } 
    },

    async expandTrendingStatuses(path) {
      const root = rootGet();
      try {
        const res = await fetch(path, { method: "GET" });
        if (!res.ok) throw new Error(`Failed to expand trending statuses (${res.status})`);
        const data = await res.json();
        const statuses = data;
        const next = data.next || null;

        root.importer?.importFetchedStatuses?.(statuses || []);

        this.fetchOrExpandTrendingStatusesSuccess(statuses, next);
      } catch (error) {
        console.error("Error expanding trending statuses:", error); 
      }
    }
  };
}
