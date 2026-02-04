import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

export const useSearch = (searchTerm, type = 'all') => {
  const { importStatusEntities } = useStatusImporter();

  return useQuery({
    // Cache key includes term and type so switching is instant
    queryKey: ['search', { q: searchTerm, type }],
    queryFn: async ({ signal }) => {
      const { data } = await api.get('/api/v2/search', {
        params: { 
          q: searchTerm, 
          type: type === 'all' ? undefined : type,
          resolve: true // Try to resolve remote URLs
        },
        signal, // Auto-cancellation
      });

      // SIDE-LOADING: Seed the cache for any accounts and statuses found
      if (data.accounts) {
        data.accounts.forEach(acc => 
          queryClient.setQueryData(['accounts', acc.id], acc)
        );
      }
      
      if (data.statuses) {
        // Use our existing importer for posts/entities
        importStatusEntities(data.statuses);
      }

      return data; // Returns { accounts: [], statuses: [], hashtags: [] }
    },
    // Don't search for empty or single-character strings
    enabled: searchTerm.trim().length > 1,
    staleTime: 1000 * 60 * 5, // Keep search results for 5 mins
  });
};

/*
const SearchResults = ({ query }) => {
  const { data, isLoading, isError } = useSearch(query);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;

  return (
    <div className="search-results">
      {/* 1. Accounts Section *//*}
      {data?.accounts.map(acc => <AccountCard key={acc.id} account={acc} />)}

      {/* 2. Hashtags Section *//*}
      {data?.hashtags.map(tag => <HashtagCard key={tag.name} tag={tag} />)}

      {/* 3. Statuses Section *//*}
      {data?.statuses.map(status => <StatusCard key={status.id} status={status} />)}
    </div>
  );
};

*/
//==================================

//above is enough but still check it later
export const useSearch2 = (value, type = 'statuses', accountId = null) => {
  const queryClient = useQueryClient();
  const { importStatusEntities } = useStatusImporter();

  return useQuery({
    // 1. Unique Cache Key replaces getState() logic
    queryKey: ['search', { q: value, type, accountId }],
    queryFn: async ({ signal }) => {
      // 2. Build Params (Ported logic)
      const params = {
        q: value,
        resolve: true,
        limit: 20,
        type,
        ...(accountId && { account_id: accountId })
      };

      const response = await api.get('/api/v2/search', { params, signal });
      const data = response.data;

      // 3. Side-Loading Entities (Replaces importFetchedAccounts/Statuses)
      if (data.accounts) {
        data.accounts.forEach(acc => queryClient.setQueryData(['accounts', acc.id], acc));
        
        // 4. Handle Relationships (Replaces fetchRelationships)
        // We prefetch them so the Follow button is ready immediately
        const accountIds = data.accounts.map(a => a.id);
        queryClient.prefetchQuery({
          queryKey: ['relationships', accountIds.sort()],
          queryFn: () => fetchRelationships(accountIds)
        });
      }

      if (data.statuses) {
        importStatusEntities(data.statuses);
      }

      return data;
    },
    // 5. Validation: An empty search doesn't return results
    enabled: value.trim().length > 0,
    staleTime: 1000 * 60 * 5, // Keep results for 5 mins
  });
};

//====================================================================
//Handling "Network Only" Data
//You don't want everything saved offline (e.g., sensitive search results). 
// You can use the meta property to exclude specific queries.

export const useSearch = (query) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: fetchSearch,
    meta: { persist: false } // Custom logic can check this in the persister
  });
};
