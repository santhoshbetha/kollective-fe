// Action-only slice for fetching 'familiar followers' and related lists.
// No local state — only actions.

export function createFamiliarFollowersSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    
    async fetchAccountFamiliarFollowers(accountId) {
      if (!accountId) return null;
      try {
        const res = await fetch(`/api/v1/accounts/familiar_followers?id[]=${accountId}`, { method: 'GET'});
        if (!res.ok) throw new Error(`Failed to fetch familiar followers (${res.status})`);
        const data = await res.json();

        const root = rootGet();
        const accounts = data.find(({ id }) => id === accountId).accounts;
        // Import accounts into the global importer if available
        root.importer?.importFetchedAccounts?.(accounts || []);
        // Notify user lists slice if present
        root.accounts.fetchRelationsships(accounts.map(acc => acc.id));
        root.userLists?.fetchFamiliarFollowersSuccess?.(accountId, data || [], null);
        return data;
      } catch (err) {
        console.error('familiarFollowersSlice.fetchFamiliarFollowers failed', err);
        return null;
      }
    }
  };
}

export default createFamiliarFollowersSlice;
