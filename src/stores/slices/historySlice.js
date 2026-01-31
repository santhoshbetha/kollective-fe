import { normalizeStatusEdit } from "../../normalizers/status-edit";
import { getIn } from "../../utils/immutableSafe";

export function createHistorySlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();
  return {
    history: {}, // Dictionary of statusId -> { loading, items }

    fetchHistoryRequest(statusId) {
      setScoped((state) => {
        // Direct mutation: Create or update the record for this status
        state.history[statusId] = {
          ...state.history[statusId],
          loading: true,
          items: [],
        };
      });
    },

    fetchHistorySuccess(statusId, historyData) {
      setScoped((state) => {
        // 1. Process items: map account IDs and mark the original version
        // 2. Reverse to show newest edits first (or as per your UI logic)
        const normalizedItems = (historyData || [])
          .map((item, i) => {
            const processed = {
              ...item,
              account: item.account?.id || item.account,
              original: i === 0,
            };
            return normalizeStatusEdit(processed);
          })
          .reverse();

        // 3. Update the record directly
        state.history[statusId] = {
          ...state.history[statusId],
          loading: false,
          items: normalizedItems,
        };
      });
    },

    fetchHistoryFail(statusId) {
      setScoped((state) => {
        if (state.history[statusId]) {
          state.history[statusId].loading = false;
        }
      });
    },

    async fetchHistory(statusId) {
      const state = rootGet();
      const actions = getActions();

      // Check current loading state via standard JS lookup
      if (state.history?.[statusId]?.loading) return;

      actions.fetchHistoryRequest(statusId);

      try {
        const response = await fetch(`/api/v1/statuses/${statusId}/history`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Import account entities via the global importer
        const accounts = (data || []).map((item) => item.account).filter(Boolean);
        actions.importFetchedAccounts?.(accounts);

        actions.fetchHistorySuccess(statusId, data);
      } catch (err) {
        actions.fetchHistoryFail(statusId);
        console.error('historySlice.fetchHistory failed', err);
      }
    }
  };
}

export default createHistorySlice;
