export const StatusListRecord = {
  next: null,
  loaded: false,
  isLoading: null,
  items: new Set(),
};

const getStatusId = (status) =>
  typeof status === "string" ? status : status.id;

const getStatusIds = (statuses) =>
  new Set((Array.isArray(statuses) ? statuses : []).map(getStatusId));

export function createstatusListsSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  // get not used
  return {
    fetchOrExpandFavouritedStatusesRequest() {
      set((state) => {
        if (!state["favourites"]) {
          state["favourites"] = { ...StatusListRecord, items: new Set() };
        }
        state["favourites"].isLoading = true;
      });
    },

    fetchOrExpandFavouritedStatusesFail() {
      set((state) => {
        if (!state["favourites"]) {
          state["favourites"] = { ...StatusListRecord, items: new Set() };
        }
        state["favourites"].isLoading = false;
      });
    },

    fetchFavouritedStatusesSuccess(statuses, next) {
      set((state) => {
        if (!state["favourites"]) {
          state["favourites"] = { ...StatusListRecord, items: new Set() };
        }
        const list = state["favourites"];
        (Array.isArray(statuses) ? statuses : []).forEach((status) =>
          list.items.add(getStatusId(status)),
        );
        list.next = next;
        list.loaded = true;
        list.isLoading = false;
      });
    },

    expandFavouritedStatusesSuccess(statuses, next) {
      set((state) => {
        if (!state["favourites"]) {
          state["favourites"] = { ...StatusListRecord, items: new Set() };
        }
        const newIds = getStatusIds(statuses);
        const list = state["favourites"];
        // merge newIds into existing Set
        for (const id of newIds) list.items.add(id);
        list.next = next;
        list.isLoading = false;
      });
    },

    fetchOrExpandAccountFavouritedStatusesRequest(accountId) {
      const key = `favourites:${accountId}`;
      set((state) => {
        if (!state[key]) {
          state[key] = { ...StatusListRecord, items: new Set() };
        }
        state[key].isLoading = true;
      });
    },

    fetchOrExpandAccountFavouritedStatusesFail(accountId) {
      const key = `favourites:${accountId}`;
      set((state) => {
        if (!state[key]) {
          state[key] = { ...StatusListRecord, items: new Set() };
        }
        state[key].isLoading = false;
      });
    },

    fetchAccountFavouritedStatusesSuccess(accountId, statuses, next) {
      const key = `favourites:${accountId}`;
      set((state) => {
        if (!state[key]) {
          state[key] = { ...StatusListRecord, items: new Set() };
        }
        const list = state[key];
        (Array.isArray(statuses) ? statuses : []).forEach((status) =>
          list.items.add(getStatusId(status)),
        );
        list.next = next;
        list.loaded = true;
        list.isLoading = false;
      });
    },

    expandAccountFavouritedStatusesSuccess(accountId, statuses, next) {
      const key = `favourites:${accountId}`;
      set((state) => {
        if (!state[key]) {
          state[key] = { ...StatusListRecord, items: new Set() };
        }
        const newIds = getStatusIds(statuses);
        const list = state[key];
        // merge newIds into existing Set
        for (const id of newIds) list.items.add(id);
        list.next = next;
        list.isLoading = false;
      });
    },

    favouriteSuccess(status) {
      const statusId = getStatusId(status);
      set((state) => {
        if (!state["favourites"]) {
          state["favourites"] = { ...StatusListRecord, items: new Set() };
        }
        // Prepend the favourite so it appears first in iteration order
        const existing = state["favourites"].items || new Set();
        state["favourites"].items = new Set([
          statusId,
          ...Array.from(existing),
        ]);
      });
    },

    unfavouriteSuccess(status) {
      const statusId = getStatusId(status);
      set((state) => {
        if (!state["favourites"]) {
          state["favourites"] = { ...StatusListRecord, items: new Set() };
        }
        state["favourites"].items.delete(statusId);
      });
    },

    fetchPinnedStatusesSuccess(statuses, next) {
      set((state) => {
        if (!state["pins"]) {
          state["pins"] = { ...StatusListRecord, items: new Set() };
        }
        const list = state["pins"];
        (Array.isArray(statuses) ? statuses : []).forEach((status) =>
          list.items.add(getStatusId(status)),
        );
        list.loaded = true;
        list.next = next;
        list.isLoading = false;
      });
    },

    pinSuccess(status) {
      const statusId = getStatusId(status);
      set((state) => {
        if (!state["pins"]) {
          state["pins"] = { ...StatusListRecord, items: new Set() };
        }
        // Prepend the pin so it appears first in iteration order
        const existing = state["pins"].items || new Set();
        state["pins"].items = new Set([statusId, ...Array.from(existing)]);
      });
    },

    unpinSuccess(status) {
      const statusId = getStatusId(status);
      set((state) => {
        if (!state["pins"]) {
          state["pins"] = { ...StatusListRecord, items: new Set() };
        }
        state["pins"].items.delete(statusId);
      });
    },

    fetchOrExpandScheduledStatusesRequest() {
      set((state) => {
        if (!state["scheduled_statuses"]) {
          state["scheduled_statuses"] = {
            ...StatusListRecord,
            items: new Set(),
          };
        }
        state["scheduled_statuses"].isLoading = true;
      });
    },

    fetchOrExpandScheduledStatusesFail() {
      set((state) => {
        if (!state["scheduled_statuses"]) {
          state["scheduled_statuses"] = {
            ...StatusListRecord,
            items: new Set(),
          };
        }
        state["scheduled_statuses"].isLoading = false;
      });
    },

    fetchScheduledStatusesSuccess(statuses, next) {
      set((state) => {
        if (!state["scheduled_statuses"]) {
          state["scheduled_statuses"] = {
            ...StatusListRecord,
            items: new Set(),
          };
        }
        const list = state["scheduled_statuses"];
        (Array.isArray(statuses) ? statuses : []).forEach((status) =>
          list.items.add(getStatusId(status)),
        );
        list.next = next;
        list.loaded = true;
        list.isLoading = false;
      });
    },

    expandScheduledStatusesSuccess(statuses, next) {
      set((state) => {
        if (!state["scheduled_statuses"]) {
          state["scheduled_statuses"] = {
            ...StatusListRecord,
            items: new Set(),
          };
        }
        const newIds = getStatusIds(statuses);
        const list = state["scheduled_statuses"];
        // merge newIds into existing Set
        for (const id of newIds) list.items.add(id);
        list.next = next;
        list.isLoading = false;
      });
    },

    cancelScheduledStatusesRequestOrSuccess(id, status) {
      const statusId = getStatusId(status);
      set((state) => {
        if (!state["scheduled_statuses"]) {
          state["scheduled_statuses"] = {
            ...StatusListRecord,
            items: new Set(),
          };
        }
        state["scheduled_statuses"].items.delete(statusId);
      });
    },

    fetchOrExpandStatusQuotesRequest(statusId) {
      const key = `quotes:${statusId}`;
      set((state) => {
        if (!state[key]) {
          state[key] = { ...StatusListRecord, items: new Set() };
        }
        state[key].isLoading = true;
      });
    },

    fetchOrExpandStatusQuotesFail(statusId) {
      const key = `quotes:${statusId}`;
      set((state) => {
        if (!state[key]) {
          state[key] = { ...StatusListRecord, items: new Set() };
        }
        state[key].isLoading = false;
      });
    },

    fetchStatusQuotesSuccess(statusId, statuses, next) {
      const key = `quotes:${statusId}`;
      set((state) => {
        if (!state[key]) {
          state[key] = { ...StatusListRecord, items: new Set() };
        }
        const list = state[key];
        (Array.isArray(statuses) ? statuses : []).forEach((status) =>
          list.items.add(getStatusId(status)),
        );
        list.next = next;
        list.loaded = true;
        list.isLoading = false;
      });
    },

    expandStatusQuotesSuccess(statusId, statuses, next) {
      const key = `quotes:${statusId}`;
      set((state) => {
        if (!state[key]) {
          state[key] = { ...StatusListRecord, items: new Set() };
        }
        const newIds = getStatusIds(statuses);
        const list = state[key];
        // merge newIds into existing Set
        for (const id of newIds) list.items.add(id);
        list.next = next;
        list.isLoading = false;
      });
    },

    fetchRecentEventsRequest() {
      set((state) => {
        if (!state["recent_events"]) {
          state["recent_events"] = { ...StatusListRecord, items: new Set() };
        }
        state["recent_events"].isLoading = true;
      });
    },

    fetchRecentEventsFail() {
      set((state) => {
        if (!state["recent_events"]) {
          state["recent_events"] = { ...StatusListRecord, items: new Set() };
        }
        state["recent_events"].isLoading = false;
      });
    },

    fetchRecentEventsSuccess(statuses, next) {
      set((state) => {
        if (!state["recent_events"]) {
          state["recent_events"] = { ...StatusListRecord, items: new Set() };
        }
        const list = state["recent_events"];
        (Array.isArray(statuses) ? statuses : []).forEach((status) =>
          list.items.add(getStatusId(status)),
        );
        list.next = next;
        list.loaded = true;
        list.isLoading = false;
      });
    },

    fetchJoinedEventsRequest() {
      set((state) => {
        if (!state["joined_events"]) {
          state["joined_events"] = { ...StatusListRecord, items: new Set() };
        }
        state["joined_events"].isLoading = true;
      });
    },

    fetchJoinedEventsFail() {
      set((state) => {
        if (!state["joined_events"]) {
          state["joined_events"] = { ...StatusListRecord, items: new Set() };
        }
        state["joined_events"].isLoading = false;
      });
    },

    fetchJoinedEventsSuccess(statuses, next) {
      set((state) => {
        if (!state["joined_events"]) {
          state["joined_events"] = { ...StatusListRecord, items: new Set() };
        }
        const list = state["joined_events"];
        (Array.isArray(statuses) ? statuses : []).forEach((status) =>
          list.items.add(getStatusId(status)),
        );
        list.next = next;
        list.loaded = true;
        list.isLoading = false;
      });
    },

    createStatusSuccess(status) {
      const statusId = getStatusId(status);
      set((state) => {
        if (!status.scheduled_at) {
          return state;
        }
        if (!state["scheduled_statuses"]) {
          state["scheduled_statuses"] = {
            ...StatusListRecord,
            items: new Set(),
          };
        }
        // Prepend the new scheduled status id so it appears first in iteration order
        const existing = state["scheduled_statuses"].items || new Set();
        state["scheduled_statuses"].items = new Set([
          statusId,
          ...Array.from(existing),
        ]);
      });
    },
  };
}

export default createstatusListsSlice;
