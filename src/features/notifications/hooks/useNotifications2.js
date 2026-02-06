import { useInfiniteQuery } from '@tanstack/react-query';

export function useNotifications2(types = []) {
  const api = useApi();

  return useInfiniteQuery({
    queryKey: ['notifications', { types }],
    queryFn: async ({ pageParam }) => {
      // Mastodon API uses max_id for older pages
      const res = await api.get('/api/v1/notifications', {
        params: { max_id: pageParam, types },
      });
      return await res.json();
    },
    initialPageParam: null,
    // The next page ID is found at the end of the current results
    getNextPageParam: (lastPage) => 
      lastPage.length > 0 ? lastPage[lastPage.length - 1].id : undefined,
  });
}
