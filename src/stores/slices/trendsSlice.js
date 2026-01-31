import { normalizeTag } from "../../normalizers/tag";

export function createTrendsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  return {
    // --- Initial State ---
    items: [],
    isLoading: false,

    fetchTrendsRequest() {
      setScoped((state) => {
        state.isLoading = true;
      });
    },

    fetchTrendsSuccess(tags) {
      setScoped((state) => {
        // Direct assignment using Immer draft
        state.items = (tags || []).map((item) => normalizeTag(item));
        state.isLoading = false;
      });
    },


    fetchTrendsFail() {
      setScoped((state) => {
        state.isLoading = false;
      });
    },

    async fetchTrends() {
      const actions = getActions();
      
      actions.fetchTrendsRequest();

      try {
        const res = await fetch(`/api/v1/trends`);
        if (!res.ok) throw new Error(`Failed to fetch trends (${res.status})`);
        
        const data = await res.json();
        actions.fetchTrendsSuccess(data);
      } catch (error) {
        console.error("TrendsSlice.fetchTrends failed", error);
        actions.fetchTrendsFail();
      }
    }
  };
}
