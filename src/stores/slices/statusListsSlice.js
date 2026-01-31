export const StatusListRecord = {
  next: null,
  loaded: false,
  isLoading: false,
  items: new Set(),
};

const getStatusId = (status) => (typeof status === "string" ? status : status?.id);

const getStatusIds = (statuses) =>
  new Set((Array.isArray(statuses) ? statuses : []).map(getStatusId));

export function createstatusListsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  const ensureList = (state, key) => {
    if (!state[key]) {
      state[key] = { ...StatusListRecord, items: new Set() };
    }
    return state[key];
  };

  const handleRequest = (key) => setScoped((s) => { ensureList(s, key).isLoading = true; });
  const handleFail = (key) => setScoped((s) => { ensureList(s, key).isLoading = false; });

  const handleSuccess = (key, statuses, next, isExpand = false) => {
    setScoped((state) => {
      const list = ensureList(state, key);
      const data = Array.isArray(statuses) ? statuses : [];

      if (!isExpand) list.items.clear(); // For fetch (non-expand), clear existing

      data.forEach((s) => list.items.add(getStatusId(s)));
      
      list.next = next;
      list.isLoading = false;
      list.loaded = true;
    });
  };

  return {
    fetchOrExpandAccountFavouritedStatusesRequest: (accId) => handleRequest(`favourites:${accId}`),
    fetchOrExpandAccountFavouritedStatusesFail: (accId) => handleFail(`favourites:${accId}`),
    fetchAccountFavouritedStatusesSuccess: (accId, statuses, next) => handleSuccess(`favourites:${accId}`, statuses, next),
    expandAccountFavouritedStatusesSuccess: (accId, statuses, next) => handleSuccess(`favourites:${accId}`, statuses, next, true),
    
    fetchOrExpandFavouritedStatusesRequest: () => handleRequest("favourites"),
    fetchOrExpandFavouritedStatusesFail: () => handleFail("favourites"),

    fetchFavouritedStatusesSuccess(statuses, next) {
      handleSuccess("favourites", statuses, next);
    },

    expandFavouritedStatusesSuccess(statuses, next) {
      handleSuccess("favourites", statuses, next, true);
    },

    favouriteSuccess(status) {
      setScoped((state) => {
        const list = ensureList(state, "favourites");
        const statusId = getStatusId(status);
        // Prepend: Convert to array, unshift, and re-create Set to preserve order
        list.items = new Set([statusId, ...Array.from(list.items)]);
      });
    },

    unfavouriteSuccess(status) {
      setScoped((state) => {
        const list = ensureList(state, "favourites");
        list.items.delete(getStatusId(status));
      });
    },

    fetchPinnedStatusesSuccess(statuses, next) {
      handleSuccess("pins", statuses, next);
    },

    pinSuccess(status) {
      setScoped((s) => {
        const list = ensureList(s, "pins");
        const id = getStatusId(status);
        list.items = new Set([id, ...Array.from(list.items)]);
      });
    },

    unpinSuccess(status) {
      setScoped((s) => {
        const list = ensureList(s, "pins");
        list.items.delete(getStatusId(status));
      });
    },

    fetchOrExpandScheduledStatusesRequest: () => handleRequest("scheduled_statuses"),
    fetchOrExpandScheduledStatusesFail: () => handleFail("scheduled_statuses"),
    fetchScheduledStatusesSuccess: (statuses, next) => handleSuccess("scheduled_statuses", statuses, next),
    expandScheduledStatusesSuccess: (statuses, next) => handleSuccess("scheduled_statuses", statuses, next, true),
    
    cancelScheduledStatusesRequestOrSuccess(id, status) {
      setScoped((s) => {
        const list = ensureList(s, "scheduled_statuses");
        list.items.delete(getStatusId(status) || id);
      });
    },

    // --- Quotes (Dynamic Key) ---
    fetchOrExpandStatusQuotesRequest: (statusId) => handleRequest(`quotes:${statusId}`),
    fetchOrExpandStatusQuotesFail: (statusId) => handleFail(`quotes:${statusId}`),
    fetchStatusQuotesSuccess: (statusId, statuses, next) => handleSuccess(`quotes:${statusId}`, statuses, next),
    expandStatusQuotesSuccess: (statusId, statuses, next) => handleSuccess(`quotes:${statusId}`, statuses, next, true),

    fetchRecentEventsRequest: () => handleRequest("recent_events"),
    fetchRecentEventsFail: () => handleFail("recent_events"),
    fetchRecentEventsSuccess: (statuses, next) => handleSuccess("recent_events", statuses, next),

    fetchJoinedEventsRequest: () => handleRequest("joined_events"),
    fetchJoinedEventsFail: () => handleFail("joined_events"),
    fetchJoinedEventsSuccess: (statuses, next) => handleSuccess("joined_events", statuses, next),

    /**
     * Optional: Add logic to move events between lists when join_state changes
     */
    joinEventSuccess(status) {
      setScoped((s) => {
        const id = getStatusId(status);
        const joinedList = ensureList(s, "joined_events");
        
        // Add to joined list and ensure iteration order (newest joined first)
        joinedList.items = new Set([id, ...Array.from(joinedList.items)]);
      });
    },
    
    createStatusListStatusSuccess(status) {
      // 1. Validation: Only handle if it's actually a scheduled status
      if (!status?.scheduled_at) return;

      const statusId = getStatusId(status);

      setScoped((state) => {
        // 2. Use helper to ensure the list exists
        const list = ensureList(state, "scheduled_statuses");

        // 3. Prepend the ID: Convert Set to Array, unshift, and re-create Set
        // This preserves the "newest first" iteration order
        list.items = new Set([statusId, ...Array.from(list.items)]);
      });
    },
  };
}

export default createstatusListsSlice;
