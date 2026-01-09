import { normalizeTag } from "../../normalizers/tag";

export function createTrendsSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  // get not used
  return {
    items: [],
    isLoading: false,

    fetchTrendsRequest() {
      set((state) => {
        state.isLoading = true;
      });
    },

    fetchTrandsSuccess(tags) {
      set((state) => {
        state.items = tags.map((item) => normalizeTag(item));
        state.isLoading = false;
      });
    },

    fetchTrendsFail() {
      set((state) => {
        state.isLoading = false;
      });
    },

    async fetchTrends() {
      this.fetchTrendsRequest();

      try {
        const res = await fetch(`/api/v1/trends`, { method: "GET" });
        if (!res.ok) throw new Error(`Failed to fetch trends (${res.status})`);
        const data = await res.json();
        this.fetchTrandsSuccess(data);
      } catch (error) {
        console.error("Error in fetchTrends try-catch:", error);
        this.fetchTrendsFail();
      }
    }
  };
}
