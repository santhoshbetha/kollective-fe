import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useBlockedAccounts = () => {
  const queryClient = useQueryClient();
  const { importAccounts } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['accounts', 'blocks'],
    queryFn: async ({ pageParam }) => {
      // 1. Fetch blocked users (Handles both initial and expanded fetch)
      const response = await api.get(pageParam || '/api/v1/blocks', {
        params: pageParam ? {} : { limit: 40 }
      });

      const data = response.data;

      // 2. SIDE-LOADING: Seed account cache
      importAccounts(data);

      // 3. RELATIONSHIPS: Prefetch relationship statuses
      // Replaces: dispatch(fetchRelationships(data.map(item => item.id)))
      const ids = data.map(account => account.id);
      if (ids.length > 0) {
        queryClient.prefetchQuery({
          queryKey: ['relationships', ids.sort()],
          queryFn: () => api.get('/api/v1/accounts/relationships', { params: { id: ids } })
        });
      }

      return {
        items: data,
        next: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
  });
};

/*
const BlockedUsersList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useBlockedAccounts();

  return (
    <div>
      {data?.pages.map(page => 
        page.items.map(account => <AccountCard key={account.id} account={account} />)
      )}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};
*/