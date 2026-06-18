import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { usePostImporter } from '../hooks/usePostImporter';

export const useFillGap = () => {
  const queryClient = useQueryClient();
  const { importFetchedPosts } = usePostImporter();

  return useMutation({
    mutationFn: async ({ maxId, minId }) => {
      const response = await api.get('/api/v1/timelines/home', {
        params: { max_id: maxId, since_id: minId, limit: 40 },
      });
      return response.data;
    },
    onSuccess: (newposts, variables) => {
      // 1. Seed the individual caches (Accounts, Polls, etc.)
      importFetchedPosts(newposts);

      // 2. Splice the new postsinto the specific Timeline cache
      queryClient.setQueryData([posts', 'home'], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            // Insert the new postsafter the 'maxId' trigger post
            tweets: injectGapResults(page.tweets, variables.maxId, newposts),
          })),
        };
      });
    },
  });
};

// Helper to find the gap spot and insert
const injectGapResults = (tweets, targetId, newItems) => {
  const index = tweets.findIndex((t) => t.id === targetId);
  if (index === -1) return tweets;
  
  const updated = [...tweets];
  updated.splice(index + 1, 0, ...newItems);
  return updated;
};

/*
const GapButton = ({ maxId, minId }: { maxId: string; minId: string }) => {
  const { mutate, isPending } = useFillGap();

  return (
    <button 
      className="gap-button" 
      onClick={() => mutate({ maxId, minId })}
      disabled={isPending}
    >
      {isPending ? 'Loading...' : '↑ Show missing posts ↑'}
    </button>
  );
};

3. Why this is better than the Soapbox Reducer approach:

    1. Localized Logic: In Redux, the gap-filling logic is scattered across actions/timelines.ts 
       and reducers/timelines.ts. Here, the entire "Fetch -> Import -> Splice" lifecycle is 
       contained in one Mutation Hook.
    2. No Global "Loading" State: You don't need a global state.timelines.isLoadingGap boolean. 
       The isPending state is local to the specific button you clicked.
    3. Cache Integrity: If you fill a gap that contains a post you already have, 
       TanStack Query's cache management prevents duplicate re-renders by ensuring the object references remain stable.
*/
