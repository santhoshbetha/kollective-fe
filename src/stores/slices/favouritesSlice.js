// Action-only slice for favourites (favourites list + favourite/unfavourite actions).
// No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

export function createFavouritesSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  // Internal helper to parse Link headers for pagination
  const getNextUrl = (res) => {
    const link = res.headers.get('Link');
    return link?.match(/<([^>]+)>;\s*rel="next"/i)?.[1] || null;
  };

  return {
    // Fetch favourited statuses for the current user
    async fetchFavouritedStatuses() {
      const state = rootGet();
      const actions = getActions();

      if (!isLoggedIn(state) || state.statusLists?.['favourites']?.isLoading) {
        return null;
      }

      actions.fetchOrExpandFavouritedStatusesRequest?.();

      try {
        const res = await fetch(`/api/v1/favourites`, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const next = getNextUrl(res);

        actions.importFetchedStatuses?.(data || []);
        actions.fetchOrExpandFavouritedStatusesSuccess?.(data || [], next);
        
        return data;
      } catch (err) {
        actions.fetchOrExpandFavouritedStatusesFail?.(err);
        console.error('favouritesSlice.fetchFavouritedStatuses failed', err);
        return null;
      }
    },

    // Expand paginated favourited statuses
    async expandFavouritedStatuses() {
      const state = rootGet();
      const actions = getActions();
      const listState = state.statusLists?.['favourites'];

      if (!isLoggedIn(state) || !listState?.next || listState?.isLoading) {
        return null;
      }

      actions.fetchOrExpandFavouritedStatusesRequest?.();

      try {
        const res = await fetch(listState.next, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const next = getNextUrl(res);

        actions.importFetchedStatuses?.(data || []);
        actions.expandFavouritedStatusesSuccess?.(data || [], next);
        
        return data;
      } catch (err) {
        actions.fetchOrExpandFavouritedStatusesFail?.(err);
        console.error('favouritesSlice.expandFavourites failed', err);
        return null;
      }
    },

    async fetchAccountFavouritedStatuses(accountId) {
      const state = rootGet();
      const actions = getActions();
      const listKey = `favourites:${accountId}`;

      if (!isLoggedIn(state) || state.statusLists?.[listKey]?.isLoading) {
        return null;
      }

      actions.fetchOrExpandAccountFavouritedStatusesRequest?.(accountId);

      try {
        const res = await fetch(`/api/v1/accounts/${accountId}/favourites`, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const next = getNextUrl(res);

        actions.importFetchedStatuses?.(data || []);
        actions.fetchAccountFavouritedStatusesSuccess?.(accountId, data || [], next);
        
        return data;
      } catch (err) {
        actions.fetchOrExpandAccountFavouritedStatusesFail?.(accountId, err);
        console.error('favouritesSlice.fetchAccountFavouritedStatuses failed', err);
        return null;
      }
    },

    async expandAccountFavouritedStatuses(accountId) {
      const state = rootGet();
      const actions = getActions();
      const listKey = `favourites:${accountId}`;
      const listState = state.statusLists?.[listKey];

      if (!isLoggedIn(state) || !listState?.next || listState?.isLoading) {
        return null;
      }

      actions.fetchOrExpandAccountFavouritedStatusesRequest?.(accountId);

      try {
        const res = await fetch(listState.next, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const next = getNextUrl(res);

        actions.importFetchedStatuses?.(data || []);
        actions.expandAccountFavouritedStatusesSuccess?.(accountId, data || [], next);
        
        return data;
      } catch (err) {
        actions.fetchOrExpandAccountFavouritedStatusesFail?.(accountId, err);
        console.error('favouritesSlice.expandAccountFavouritedStatuses failed', err);
        return null;
      }
    }
  };
}
