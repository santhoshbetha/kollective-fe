// expandSearch 
//No, this is not required. This entire thunk is replaced by the fetchNextPage function within TanStack's 
// useInfiniteQuery. In Redux, you had to manually track the offset (by checking the size of the current list) 
// and the next URL. In TanStack Query, the hook manages the list of pages and the cursors for you.


export const useInfiniteSearch = (value, type = 'statuses', accountId = null) => {
  const queryClient = useQueryClient();
  const { importStatusEntities } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['search', 'infinite', { value, type, accountId }],
    queryFn: async ({ pageParam }) => {
      // Logic: Use the next URL if available, otherwise fall back to params (Ported)
      const isUrl = typeof pageParam === 'string' && pageParam.startsWith('http');
      const url = isUrl ? pageParam : '/api/v2/search';
      
      const params = isUrl ? {} : {
        q: value,
        type,
        limit: 20,
        offset: pageParam || 0,
        ...(accountId && { account_id: accountId })
      };

      const response = await api.get(url, { params });
      const data = response.data;

      // SIDE-LOADING (Matches expandSearch side-effects)
      if (data.accounts) {
        const accountIds = data.accounts.map(a => a.id);
        // Seed accounts
        data.accounts.forEach(acc => queryClient.setQueryData(['accounts', acc.id], acc));
        // Fetch relationships (Replaces dispatch(fetchRelationships))
        queryClient.prefetchQuery({
          queryKey: ['relationships', accountIds.sort()],
          queryFn: () => fetchRelationships(accountIds)
        });
      }
      
      if (data.statuses) {
        importStatusEntities(data.statuses);
      }

      return {
        ...data,
        // Mastodon provides the next URL in the 'Link' header
        nextUrl: extractLinkRel(response.headers.get('Link'), 'next'),
        // Or if using offset-based pagination
        nextOffset: (pageParam || 0) + 20 
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextUrl || lastPage.nextOffset,
    enabled: !!value,
  });
};
