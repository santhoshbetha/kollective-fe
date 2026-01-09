// Action-only slice for favourites (favourites list + favourite/unfavourite actions).
// No local state — only actions.

import { castArray } from "lodash";
import { isLoggedIn } from "../../utils/auth";

export function createFavouritesSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    // Fetch favourited statuses for an account
    async fetchFavouritedStatuses() {
      const root = rootGet();
      if (!isLoggedIn(root)) return null;

      if (root.statusLists['favourites']?.isLoading) {
        return;
      }

      root.statusLists.fetchOrExpandFavouritedStatusesRequest();

      try {
        const res = await fetch(`/api/v1/favourites`, { method: 'GET'});
        if (!res.ok) throw new Error(`Failed to fetch favourites (${res.status})`);
        const data = await res.json();
        const next = res.next();
        root.importer?.importFetchedStatuses?.(data || []);
        root.statusLists.fetchOrExpandFavouritedStatusesSuccess(data || [], next);
        return data;
      } catch (err) {
        root.statusLists.fetchOrExpandFavouritedStatusesFail(err);
        console.error('favouritesSlice.fetchFavouritedStatuses failed', err);
        return null;
      }
    },

    // Expand paginated favourited statuses
    async expandFavouritedStatuses() {
      const root = rootGet();
      if (!isLoggedIn(root)) return null;

      const url = root.statusLists['favourites']?.next || null;

      if (url === null || root.statusLists['favourites']?.isLoading) {
        return;
      }
      root.statusLists.fetchOrExpandFavouritedStatusesRequest();
      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to expand favourites (${res.status})`);
        const data = await res.json();
        const next = res.next();
        root.importer?.importFetchedStatuses?.(data || []);
        root.statusLists?.expandFavouritedStatusesSuccess?.(data || [], next);
        return data;
      } catch (err) {
        root.statusLists?.fetchOrExpandFavouritedStatusesFail?.(err);
        console.error('favouritesSlice.expandFavourites failed', err);
        return null;
      }
    },

    async fetchAccountfavouritedStatuses(accountId) {
      const root = rootGet();
      if (!isLoggedIn(root)) return null;

      if (root.statusLists[`favourites:${accountId}`]?.isLoading) {
        return;
      }

      root.statusLists.fetchOrExpandAccountFavouritedStatusesRequest(accountId)

      try {
        const res = await fetch(`/api/v1/accounts/${accountId}/favourites`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch account favourites (${res.status})`);
        const data = await res.json();
        const next = res.next();
        root.importer?.importFetchedStatuses?.(data || []);
        root.statusLists.fetchAccountFavouritedStatusesSuccess(accountId, data || [], next);
        return data;
      } catch(err) {
        root.statusLists.fetchOrExpandAccountFavouritedStatusesFail(accountId, err);
        console.error('favouritesSlice.fetchAccountFavouritedStatuses failed', err);
      }
    },

    async expandAccountFavouritedStatuses(accountId) {
      const root = rootGet();
      if (!isLoggedIn(root)) return null;

      const url = root.statusLists[`favourites:${accountId}`]?.next || null;

      if (url === null || root.statusLists[`favourites:${accountId}`]?.isLoading) {
        return;
      }
      root.statusLists.fetchOrExpandAccountFavouritedStatusesRequest(accountId);
      try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to expand account favourites (${res.status})`);
        const data = await res.json();
        const next = res.next();
        root.importer?.importFetchedStatuses?.(data || []);
        root.statusLists.expandAccountFavouritedStatusesSuccess(accountId, data || [], next);
        return data;
      } catch (err) {
        root.statusLists.fetchOrExpandAccountFavouritedStatusesFail(accountId, err);
        console.error('favouritesSlice.expandAccountFavouritedStatuses failed', err);
        return null;
      }
    }
  };
}

export default createFavouritesSlice;
