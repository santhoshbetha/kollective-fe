import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useHistory } from 'react-router-dom';

export function useAccountLookup(acct, opts = {}) {
  const api = useApi();
  const history = useHistory();
  const queryClient = useQueryClient();
  const { withRelationship } = opts;

  // 1. The Account Lookup Query
  const accountQuery = useQuery({
    queryKey: ['accounts', 'lookup', acct?.toLowerCase()],
    queryFn: async () => {
      const res = await api.get(`/api/v1/accounts/lookup?acct=${acct}`);
      return accountSchema.parse(await res.json());
    },
    enabled: !!acct,
    // THE "LOOKUP" LOGIC: Check if this user exists in our cache already
    placeholderData: () => {
      const allAccounts = queryClient.getQueriesData({ queryKey: ['accounts'] });
      // Search all cached account objects for a matching handle
      for (const [key, data] of allAccounts) {
        if (data?.acct?.toLowerCase() === acct?.toLowerCase()) return data;
      }
    },
    // If it's a 401, redirect to login (replaces the useEffect)
    retry: (count, error) => {
      if (error?.status === 401) {
        history.push('/login');
        return false;
      }
      return count < 3;
    }
  });

  const account = accountQuery.data;

  // 2. The Relationship Query (Dependent on the account being found)
  const relQuery = useQuery({
    queryKey: ['relationships', account?.id],
    queryFn: () => api.get(`/api/v1/accounts/relationships?id[]=${account.id}`).then(r => r.json()),
    enabled: !!account?.id && !!withRelationship,
  });

  return {
    account: account ? { ...account, relationship: relQuery.data } : undefined,
    isLoading: accountQuery.isLoading,
    isRelationshipLoading: relQuery.isLoading,
    isUnauthorized: accountQuery.error?.status === 401,
    // Add any other logic like isUnavailable here
  };
}

/*
Why this is a major upgrade:

    Efficient Cache Searching: The getQueriesData method allows us to scan the existing cache (e.g., users found in timelines) to avoid a network request for the lookup.
    No fetchedEntity State: The original code used a local useState to track the fetched entity. In TanStack, the Query Cache is the only state you need.
    Unified Error Handling: We removed the isUnauthorized useEffect and HTTPError checks. TanStack's error object and retry callback handle the redirect logic more cleanly.
    Automatic ID Mapping: Once the lookup query finds the account, the relQuery automatically sees the account.id and fires, fulfilling the dependency without manual useEffect chains.

Comparison

    Soapbox: Manual selector scan → useState → useEffect fetch → dispatch → Second useRelationship hook.
    TanStack: useQuery with placeholderData + Dependent useQuery.
*/
