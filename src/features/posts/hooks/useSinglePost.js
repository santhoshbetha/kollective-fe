import { useQuery } from '@tanstack/react-query';
import { useFilters } from '@/features/filters/api/useFilters';
import { checkFiltered } from '../../filters/utils/filterHelpers';
import { fetchPost } from '../api/posts';

//================================================================================
//replaces makeGetPost
//This replaces the makeGetPost selector. It handles the
// reblog nesting and the filter-checking (Social/Content filtering) at the data layer.

export const useSinglePost = (postId, expectedUsername) => {
  const { data: filters } = useFilters(); // Get current user filters
  //const me = useAuthStore(s => s.me?.id);

  return useQuery({
    queryKey: ['posts', 'detail', postId],
    
    queryFn: () => fetchPost(postId),
    
    // REPLACES: The 'combiner' logic from your selector
    select: (post) => {
      if (!post || !post.account) return null;

      // 1. Ownership/Username Validation (Logic from your selector)
      if (expectedUsername && post.account.acct !== expectedUsername) {
        return null;
      }

      // 2. Handle Reblog Nesting
      // If it's a reblog, the 'reblog' property is already part of the object
      const targetpost = post.reblog || post;

      // 3. Content Filtering (Logic from checkFiltered)
      let filtered = false;
      //if (post.account.id !== me) {
        filtered = checkFiltered(targetpost.search_index || '', filters);
      //}

      return {
        ...post,
        filtered,
        // Ensure reblog is flattened or nested as needed by your UI
        reblog: post.reblog || null, 
      };
    },
    enabled: !!postId,
  });
};
/*
1. Scoped Memoization: The select function only re-runs if the post data or the filters change. 
  It doesn't trigger when unrelated parts of the Redux state (like your chat messages or notifications)
  update TanStack Query Selectors.
2. Zero Infrastructure: You don't need to "make" a selector factory (makeGetPost). 
   Every component that calls usePost(id) gets its own subscription to that specific post data.
3. Built-in Null Safety: If the post is deleted or not found, TanStack Query handles 
   the isLoading and isError states natively, so you don't have to return null and check 
   for it manually in every component.
*/
/*
const PostDetail = ({ id, username }) => {
  const { data: post, isLoading } = usePost(id, username);

  if (isLoading) return <LoadingSpinner />;
  if (!post || post.filtered) return <FilteredPlaceholder />;

  return (
    <div className="post-detail">
       <PostContent content={post.content} />
       <ActionBar post={post} />
    </div>
  );
};
*/
