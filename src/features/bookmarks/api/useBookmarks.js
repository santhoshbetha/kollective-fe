import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';

export const useBookmarks = () => {
  const { importStatusEntities } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['statuses', 'timeline', 'bookmarks'],
    queryFn: async ({ pageParam }) => {
      const response = await api.get('/api/v1/bookmarks', {
        params: { max_id: pageParam, limit: 20 }
      });

      // SIDE-LOADING: Seed the global status/account cache
      importStatusEntities(response.data);

      return {
        items: response.data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    staleTime: 1000 * 60 * 10, // Bookmarks are generally stable
  });
};
