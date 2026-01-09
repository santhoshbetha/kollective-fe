import { normalizeStatusEdit } from "../../normalizers/status-edit";
import { getIn } from "../../utils/immutableSafe";

export function createHistorySlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  return {
    history: {},

    fetchHistoryRequest(statusId) {
      set((state) => {
        const existingRecord = state.history[statusId];

        const newRecord = {
          // Spread existing properties first if the record already exists
          ...(existingRecord || {}),
          loading: true,
          items: [],
        };

        return {
          history: {
            ...state.history,
            [statusId]: newRecord,
          },
        };
      });
    },

    fetchHistorySuccess(statusId, history) {
      set((state) => {
        // 1. Map, modify properties (account, original), and reverse
        const processedItems = history
          .map((x, i) => ({
            ...x,
            account: x.account.id, // Assuming x.account is an object with an 'id'
            original: i === 0,
          }))
          .reverse();

        // 2. Normalize using the external function
        const normalizedItems = processedItems.map(normalizeStatusEdit);

        // 3. Create the new history record using plain JS immutability
        const newRecord = {
          ...(state.history[statusId] || {}),
          loading: false, // Set loading to false
          items: normalizedItems, // Set the processed list of items
        };

        return {
          history: {
            ...state.history,
            [statusId]: newRecord,
          },
        };
      });
    },

    fetchHistoryFail(statusId) {
      set((state) => {
        // Get the current record. The Immutable.js code implied we might create a default
        // if one doesn't exist, though typically you'd expect a record to exist before
        // you stop its loading state. We ensure a fallback object is provided.
        const currentRecord = state.history[statusId] || {
          loading: false, // Default if nothing is found
          items: [],
        };

        // Create a new record with just the 'loading' flag updated immutably
        const newRecord = {
          ...currentRecord,
          loading: false,
        };

        return {
          history: {
            ...state.historyMap,
            [statusId]: newRecord,
          },
        };
      });
    },

    async fetchHistory(statusId) {
      const root = rootGet();
      const loading = getIn(root.history, [statusId, 'loading']);

      if (loading) return;

      this.fetchHistoryRequest(statusId);

      try {
        const response = await fetch(`/api/v1/statuses/${statusId}/history`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json() || [];
        root.importer.importFetchedAccounts(data.map((item) => item.account));
        this.fetchHistorySuccess(statusId, data);
      } catch (err) {
        this.fetchHistoryFail(statusId);
        console.error('historySlice.fetchHistory failed', err);
      }
    }
  };
}

export default createHistorySlice;
