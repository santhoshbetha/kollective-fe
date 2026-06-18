import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryClient } from '../../../lib/queryClient';
import { syncPostInCache } from '../utils/cacheSync';

// Hook: useRefreshPost
// Purpose: Background refresh for a single post detail view

//Background Refresh
export const useRefreshPost = (postId) => {
  return useQuery({
    queryKey: ['posts', 'detail', postId],
    queryFn: () => api.get(`/api/v1/posts/${postId}`).then(res => res.data),
    
    // 1. BACKGROUND POLL: Refresh every 60s while looking at the post
    refetchInterval: 60000,
    
    // 2. SMART SYNC: Only poll if the tab is focused
    refetchIntervalInBackground: false,
    
    // 3. CACHE SYNC: Ensure timelines update when the detail is refetched
    onSuccess: (data) => {
      syncPostInCache(queryClient, postId, data);
    }
  });
};
/*
const PostCard = ({ post }) => {
  // If the background refresh changes the content, this component re-renders instantly
  return (
    <div className="post-card">
      <p>{post.content}</p>
      {post.edited_at && (
        <span className="text-xs italic" title={`Last edit: ${post.edited_at}`}>
          (edited)
        </span>
      )}
    </div>
  );
};
*/