import { useInfiniteQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { statusSchema } from '../../../schemas';
import api from '../../../api/clientN';

//export type TimelineType = 'home' | 'local' | 'public';

export function useTimeline(type = 'home') {

  return useInfiniteQuery({
    // Key includes the 'type' so Home and Local feeds don't mix
    queryKey: ['timeline', type],

    queryFn: async ({ pageParam }) => {
      // Mastodon API uses 'max_id' for pagination (getting older posts)
      const response = await api.get(`/api/v1/timelines/${type}`, {
        params: { 
          max_id: pageParam,
          limit: 20 
        },
      });
      const data = await response.json();
      return z.array(statusSchema).parse(data);
    },

    // The first fetch has no ID
    initialPageParam: undefined,

    // Logic to extract the ID of the last post to use for the next fetch
    getNextPageParam: (lastPage) => {
      return lastPage.length > 0 ? lastPage[lastPage.length - 1].id : undefined;
    },

    // Keep the feed in memory so it's instant when navigating back
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/*
const { 
  data, 
  fetchNextPage, 
  hasNextPage, 
  isFetchingNextPage 
} = useTimeline('home');

// data.pages is an array of arrays [[post1, post2], [post3, post4]]
const allPosts = data?.pages.flat() ?? [];

return (
  <div onScroll={/* handle infinite scroll check *//*}>
    {allPosts.map(post => (
      <StatusCard key={post.id} status={post} />
    ))}

    {hasNextPage && (
      <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
        {isFetchingNextPage ? 'Loading...' : 'Load Older Posts'}
      </button>
    )}
  </div>
);

*/
