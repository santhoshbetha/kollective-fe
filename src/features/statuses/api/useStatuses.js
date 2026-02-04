import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter';
import { fetchContext } from './statuses';

// --- 1. THE TIMELINE (Infinite Feed) ---
// REPLACES: fetchStatuses thunk
export const useTimeline = (timelineType = 'home') => {
  const { importFetchedStatuses } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['statuses', 'timeline', timelineType],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/api/v1/timelines/${timelineType}`, {
        params: { max_id: pageParam, limit: 20 }
      });
      
      // Seed the cache for individual statuses/accounts/polls
      importFetchedStatuses(response.data); 
      return response.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id ?? undefined,
    staleTime: 1000 * 60 * 2, // 2 mins
  });
};

// --- 2. POSTING (Mutation) ---
// REPLACES: postStatus thunk
export const usePostStatus = (timelineType = 'home') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newStatus) => api.post('/api/v1/statuses', newStatus).then(res => res.data),
    onSuccess: () => {
      // Invalidate the timeline to show the new post
      queryClient.invalidateQueries({ queryKey: ['statuses', 'timeline', timelineType] });
    },
  });
};

// --- 3. SINGLE STATUS ---
// We use the version we built earlier that supports context-pulling
export const useStatus = (statusId, conversationId = null) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['status', statusId, conversationId],
    queryFn: () => api.get(`/api/v1/statuses/${statusId}`).then(res => res.data),
    initialData: () => {
      if (conversationId) {
        const context = queryClient.getQueryData(['status', 'context', conversationId]);
        return context?.allStatuses.get(statusId);
      }
      return undefined;
    },
    enabled: !!statusId,
  });
};

/*
function HomeTimeline() {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useTimeline('home');

  return (
    <div>
      {data?.pages.map((page) => 
        page.map(status => (
          <StatusItem key={status.id} statusId={status.id} />
        ))
      )}
      <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
      </button>
    </div>
  );
}

Move to TanStack: items, isLoading, error, pagination.
Move to Zustand/Redux: isComposeModalOpen, draftContent
*/

//======================================================================

export const usePostReply = (conversationId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The actual API call
    mutationFn: ({ statusId, content }) => 
      api.post(`/api/v1/statuses`, { 
        in_reply_to_id: statusId, 
        status: content 
      }).then(res => res.data),

    // 2. What happens after success
    onSuccess: () => {
      // Invalidate the context query to trigger a background re-fetch
      // This ensures the new reply shows up in the thread list
      queryClient.invalidateQueries({ 
        queryKey: ['status', 'context', conversationId] 
      });
    },
  });
};

