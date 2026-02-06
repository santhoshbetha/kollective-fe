import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteEntities(queryKey, fetchFn, opts = {}) {
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      // If we have a pageParam (a URL from a previous 'next' link), use it
      const response = pageParam ? await fetch(pageParam) : await fetchFn();
      const json = await response.json();

      // Extract pagination from 'Link' header (standard Mastodon/Link header logic)
      const linkHeader = response.headers.get('link');
      const nextUrl = linkHeader?.match(/<([^>]+)>;\s*rel="next"/)?.[1];
      const prevUrl = linkHeader?.match(/<([^>]+)>;\s*rel="prev"/)?.[1];
      
      return {
        items: json,
        nextUrl,
        prevUrl,
        totalCount: response.headers.get('x-total-count'),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextUrl,
    getPreviousPageParam: (firstPage) => firstPage.prevUrl,
    staleTime: opts.staleTime ?? 60000,
    enabled: opts.enabled ?? true,
  });
}
