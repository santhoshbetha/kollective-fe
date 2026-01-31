// Action-only slice for fetching 'familiar followers' and related lists.
// No local state — only actions.

export function createFamiliarFollowersSlice(setScoped, getScoped, rootSet, rootGet) {
  // Helper to access all actions spread onto the root store
  const getActions = () => rootGet();

  return {
    async fetchAccountFamiliarFollowers(accountId) {
      if (!accountId) return null;

      const actions = getActions();

      try {
        // Standard fetch with array param syntax
        const res = await fetch(`/api/v1/accounts/familiar_followers?id[]=${accountId}`, { 
          method: 'GET'
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();

        // 1. Find the specific result for this accountId
        const result = data.find(({ id }) => id === accountId);
        const accounts = result?.accounts || [];

        // 2. Import accounts via the global importer action
        actions.importFetchedAccounts?.(accounts);

        // 3. Prefetch relationships for these accounts
        if (accounts.length > 0) {
          const accountIds = accounts.map(acc => acc.id);
          // Note: Corrected the typo 'fetchRelationsships' from your original code
          await actions.fetchRelationships?.(accountIds);
        }

        // 4. Update the user list state for familiar followers
        // Renamed to be unique to avoid collisions in the spread store
        actions.userListFamiliarFollowersSuccess?.(accountId, data, null);

        return data;
      } catch (err) {
        console.error('familiarFollowersSlice.fetchAccountFamiliarFollowers failed', err);
        return null;
      }
    }
  };
}

export default createFamiliarFollowersSlice;
