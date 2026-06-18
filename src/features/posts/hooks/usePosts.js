import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { usePostImporter } from './usePostImporter';

// --- 1. THE TIMELINE (Infinite Feed) ---
// REPLACES: fetchPosts thunk
export const useTimeline = (timelineType = 'home') => {
  const { importFetchedPosts } = usePostImporter();

  return useInfiniteQuery({
    queryKey: [posts', 'timeline', timelineType],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/api/v1/timelines/${timelineType}`, {
        params: { max_id: pageParam, limit: 20 }
      });
      
      // Seed the cache for individual posts/accounts/polls
      importFetchedPosts(response.data); 
      return response.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id ?? undefined,
    staleTime: 1000 * 60 * 2, // 2 mins
  });
};

// --- 2. POSTING (Mutation) ---
// REPLACES: postPost thunk
export const usePostPost = (timelineType = 'home') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPost) => api.post('/api/v1/posts', newPost).then(res => res.data),
    onSuccess: () => {
      // Invalidate the timeline to show the new post
      queryClient.invalidateQueries({ queryKey: [posts', 'timeline', timelineType] });
    },
  });
};

// --- 3. SINGLE Post ---
// We use the version we built earlier that supports context-pulling
export const usePost = (postId, conversationId = null) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['post', postId, conversationId],
    queryFn: () => api.get(`/api/v1/posts/${postId}`).then(res => res.data),
    initialData: () => {
      if (conversationId) {
        const context = queryClient.getQueryData(['post', 'context', conversationId]);
        return context?.allPosts.get(postId);
      }
      return undefined;
    },
    enabled: !!postId,
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
        page.map(post => (
          <PostItem key={post.id} postId={post.id} />
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
    mutationFn: ({ postId, content }) => 
      api.post(`/api/v1/posts`, { 
        in_reply_to_id: postId, 
        post: content 
      }).then(res => res.data),

    // 2. What happens after success
    onSuccess: () => {
      // Invalidate the context query to trigger a background re-fetch
      // This ensures the new reply shows up in the thread list
      queryClient.invalidateQueries({ 
        queryKey: ['post', 'context', conversationId] 
      });
    },
  });
};

