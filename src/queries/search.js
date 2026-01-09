import { useInfiniteQuery } from '@tanstack/react-query';

import { useApi } from '../hooks/useApi.js';
import { flattenPages } from '../utils/queries.js';

export default function useAccountSearch(q) { //san this search
  const api = useApi();

  const getAccountSearch = async (q, pageParam) => {
    const nextPageLink = pageParam?.link;

    // Build query string; ApiClient.get returns parsed JSON, so include params in the URL
    if (nextPageLink) {
      // If caller provided a next link, use it directly
      const data = await api.get(nextPageLink);
      return { result: data, link: undefined, hasMore: false };
    }

    const params = new URLSearchParams();
    if (q !== undefined && q !== null) params.set('q', q);
    params.set('limit', '10');
    params.set('followers', 'true');

    const uri = `/api/v1/accounts/search?${params.toString()}`;
    const data = await api.get(uri);

    // ApiClient currently returns parsed JSON and doesn't expose a `next()` helper,
    // so we can't infer hasMore from headers here. Return result and leave pagination
    // to the caller or to server-provided `link` values if available in the payload.
    return {
      result: data,
      link: undefined,
      hasMore: false,
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ['search', 'accounts', q],
    queryFn: ({ pageParam }) => getAccountSearch(q, pageParam),
    keepPreviousData: true,
    initialPageParam: { link: undefined },
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = flattenPages(queryInfo.data);

  return {
    ...queryInfo,
    data,
  };
}
