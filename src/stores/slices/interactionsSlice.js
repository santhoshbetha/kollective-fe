// Action-only slice for interactions (likes, boosts, etc.). No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

export function createInteractionsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  const getNextUrl = (res) => {
    const link = res.headers.get('Link');
    return link?.match(/<([^>]+)>;\s*rel="next"/i)?.[1] || null;
  };

  return {
    async reblog(status, effects) {
      const state = rootGet();
      const actions = getActions();

      // 1. Auth Guard
      if (!isLoggedIn(state)) return;

      // 2. Optimistic Update & Side Effects
      actions.reblogRequest?.(status);
      effects?.reblogEffect?.(status.id);

      try {
        const res = await fetch(`/api/v1/statuses/${status.id}/reblog`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Failed to reblog status (${res.status})`);
        
        const data = await res.json();

        // 3. Import the returned reblog status via the global importer
        // Note: data.reblog contains the updated status with your 'reblogged: true' flag
        actions.importFetchedStatus?.(data.reblog || data);

      } catch (err) {
        console.error('interactionsSlice.reblog failed', err);
        
        // 4. Revert optimistic state on failure
        actions.reblogFail?.(status, err);
      }
    },

    async unreblog(status, effects) {
      const state = rootGet();
      const actions = getActions();

      if (!isLoggedIn(state)) return;

      // 1. Optimistic Update
      actions.unreblogRequest?.(status);
      effects?.unreblogEffect?.(status.id);

      try {
        const res = await fetch(`/api/v1/statuses/${status.id}/unreblog`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Failed to unreblog (${res.status})`);
        
        const data = await res.json();
        // Sync with the returned status data
        actions.importFetchedStatus?.(data);

      } catch (err) {
        console.error('interactionsSlice.unreblog failed', err);
        // 2. Revert optimistic state on failure
        actions.unreblogFail?.(status, err);
        effects?.reblogEffect?.(status.id);
      }
    },

    toggleReblog(status, effects) {
      const actions = getActions();
      // Use flat root actions instead of 'this'
      if (status.reblogged) {
        actions.unreblog(status, effects);
      } else {
        actions.reblog(status, effects);
      }
    },

    async favourite(status) {
      const state = rootGet();
      const actions = getActions();

      if (!isLoggedIn(state)) return;

      // 3. Optimistic Favourite (Request)
      actions.favouriteRequest?.(status);

      try {
        const res = await fetch(`/api/v1/statuses/${status.id}/favourite`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Failed to favourite (${res.status})`);
        
        const data = await res.json();
        // Notify status list of success to handle count/icon updates
        actions.favouriteSuccess?.(status, data);
      } catch (err) {
        console.error('interactionsSlice.favourite failed', err);
        actions.favouriteFail?.(status);
      }
    },

    async unfavourite(status) {
      const state = rootGet();
      const actions = getActions();

      if (!isLoggedIn(state)) return;

      // 4. Optimistic Unfavourite (Request)
      actions.unfavouriteRequest?.(status);

      try {
        const res = await fetch(`/api/v1/statuses/${status.id}/unfavourite`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Failed to unfavourite (${res.status})`);
        
        const data = await res.json();
        actions.unfavouriteSuccess?.(status, data);
      } catch (err) {
        console.error('interactionsSlice.unfavourite failed', err);
        actions.unfavouriteFail?.(status);
      }
    },

    toggleFavourite(status) {
      const actions = getActions();
      // Use root actions instead of 'this' context
      if (status.favourited) {
        actions.unfavourite(status);
      } else {
        actions.favourite(status);
      }
    },

    async dislike(status) {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state)) return;

      // 1. Optimistic Update (if your statuses slice handles this)
      actions.dislikeRequest?.(status);

      try {
        const res = await fetch(`/api/v1/statuses/${status.id}/dislike`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Failed to dislike (${res.status})`);
        
        const data = await res.json();
        // Sync state with returned status object
        actions.importFetchedStatus?.(data);
      } catch (err) {
        console.error('interactionsSlice.dislike failed', err);
        actions.dislikeFail?.(status, err);
      }
    },

    async undislike(status) {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state)) return;

      // 2. Optimistic Update
      actions.undislikeRequest?.(status);

      try {
        const res = await fetch(`/api/v1/statuses/${status.id}/undislike`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Failed to undislike (${res.status})`);
        
        const data = await res.json();
        actions.importFetchedStatus?.(data);
      } catch (err) {
        console.error('interactionsSlice.undislike failed', err);
        actions.undislikeFail?.(status, err);
      }
    },

     toggleDislike(status) {
      const actions = getActions();
      if (status.disliked) {
        actions.undislike(status);
      } else {
        actions.dislike(status);
      }
    },

    async fetchReblogs(id) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return;
      
      try {
        const res = await fetch(`/api/v1/statuses/${id}/reblogged_by`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const next = getNextUrl(res);

        actions.importFetchedAccounts?.(data);
        actions.fetchRelationships?.(data.map(acc => acc.id));
        actions.userListFetchReblogSuccess?.(id, data, next);
      } catch (err) {
        console.error('interactionsSlice.fetchReblogs failed', err);
      }
    },

    async expandReblogs(id, path) {
      const actions = getActions();
      try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const next = getNextUrl(res);

        actions.importFetchedAccounts?.(data);
        actions.fetchRelationships?.(data.map(acc => acc.id));
        actions.userListExpandReblogSuccess?.(id, data, next);
      } catch (err) {
        console.error('interactionsSlice.expandReblogs failed', err);
      }
    },

    async fetchFavourites(id) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return;
      
      try {
        const res = await fetch(`/api/v1/statuses/${id}/favourited_by`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const next = getNextUrl(res);

        actions.importFetchedAccounts?.(data);
        actions.fetchRelationships?.(data.map(acc => acc.id));
        actions.userListFetchFavouritesSuccess?.(id, data, next);
      } catch (err) {
        console.error('interactionsSlice.fetchFavourites failed', err);
      }
    },

    async expandFavourites(id, path) {
      const actions = getActions();
      try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const next = getNextUrl(res);

        actions.importFetchedAccounts?.(data);
        actions.fetchRelationships?.(data.map(acc => acc.id));
        actions.userListExpandFavouritesSuccess?.(id, data, next);
      } catch (err) {
        console.error('interactionsSlice.expandFavourites failed', err);
      }
    },

    async fetchDislikes(id) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return;      

      try {
        const res = await fetch(`/api/v1/statuses/${id}/disliked_by`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();

        actions.importFetchedAccounts?.(data);
        actions.fetchRelationships?.(data.map(acc => acc.id));
        actions.userListFetchDislikesSuccess?.(id, data);
      } catch (err) {
        console.error('interactionsSlice.fetchDislikes failed', err);
      }
    },

    async fetchReactions(id) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/statuses/${id}/reactions`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json(); 

        // Extract accounts from the reaction entities
        const accounts = data.map(reaction => reaction.account).filter(Boolean);
        actions.importFetchedAccounts?.(accounts);
        
        actions.userListFetchReactionsSuccess?.(id, data);
      } catch (err) {
        console.error('interactionsSlice.fetchReactions failed', err);
      }
    },

    async pin(status) {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state)) return;

      try {
        const res = await fetch(`/api/v1/statuses/${status.id}/pin`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Pin failed (${res.status})`);

        const data = await res.json();
        
        // 1. Import updated status and notify list
        actions.importFetchedStatus?.(data);
        actions.pinSuccess?.(status);
        
        return data;
      } catch (err) {
        console.error('interactionsSlice.pin failed', err);
        return null;
      }
    },

    async pinToGroup(status, group) {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state)) return;

      try {
        const res = await fetch(`/api/v1/groups/${group.id}/statuses/${status.id}/pin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ group_id: group.id }),
        });

        if (!res.ok) throw new Error(`Group pin failed (${res.status})`);

        const data = await res.json();
        
        actions.importFetchedStatus?.(data);
        actions.pinToGroupSuccess?.(status, group);
        
        return data;
      } catch (err) {
        console.error('interactionsSlice.pinToGroup failed', err);
        return null;
      }
    },

    async unpin(status) {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state)) return;

      try {
        const res = await fetch(`/api/v1/statuses/${status.id}/unpin`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error(`Unpin failed (${res.status})`);

        const data = await res.json();
        
        actions.importFetchedStatus?.(data);
        actions.unpinSuccess?.(status);
        
        return data;
      } catch (err) {
        console.error('interactionsSlice.unpin failed', err);
        return null;
      }
    }
    
  }
}

export default createInteractionsSlice;
