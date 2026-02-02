import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useFamiliarFollowers = (accountId) => {
  const queryClient = useQueryClient();
  const { importAccounts } = useStatusImporter();

  return useQuery({
    // Unique key per account profile
    queryKey: ['accounts', accountId, 'familiar-followers'],
    queryFn: async () => {
      const response = await api.get(`/api/v1/accounts/familiar_followers`, {
        params: { 'id[]': [accountId] }
      });
      
      // 1. Logic Port: Find the accounts array for this specific ID
      const data = response.data.find(item => item.id === accountId);
      const accounts = data?.accounts || [];

      // 2. SIDE-LOADING: Seed global account cache
      // Replaces dispatch(importFetchedAccounts(accounts))
      importAccounts(accounts);

      // 3. PREFETCH RELATIONSHIPS: Ensure buttons are ready
      // Replaces dispatch(fetchRelationships(ids))
      const ids = accounts.map(a => a.id);
      if (ids.length > 0) {
        queryClient.prefetchQuery({
          queryKey: ['relationships', ids.sort()],
          queryFn: () => api.get('/api/v1/accounts/relationships', { 
            params: { id: ids } 
          }).then(res => res.data)
        });
      }

      return accounts;
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 15, // Cache results for 15 minutes
  });
};

/*
const FamiliarFollowers = ({ accountId }) => {
  const { data: familiarOnes, isLoading } = useFamiliarFollowers(accountId);

  if (isLoading || !familiarOnes?.length) return null;

  return (
    <div className="familiar-followers-section">
      <span>Followed by:</span>
      <div className="avatar-stack">
        {familiarOnes.slice(0, 5).map(acc => (
          <AccountAvatar key={acc.id} account={acc} size={24} />
        ))}
        {familiarOnes.length > 5 && <span>+{familiarOnes.length - 5}</span>}
      </div>
    </div>
  );
};

Automatic Cache Invalidation: If you follow someone new who happens to also follow this account, TanStack Query will background-refetch the list automatically to keep the social proof updated.
Zero Loading Flickers: Since we prefetch the relationships, clicking on one of these "Familiar Followers" will show your relationship with them (Follow/Unfollow) instantly without a second spinner.
Cleaner Reducers: You can delete the FAMILIAR_FOLLOWERS actions and the corresponding logic from your accountsSlice.ts.

*/
