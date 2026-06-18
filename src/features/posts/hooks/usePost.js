//post details:
// src/features/posts/api/usePost.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPost } from '../api/posts';
import { useFilters } from '@/features/filters/api/useFilters';
import { checkFiltered } from '../../filters/utils/filterHelpers';

export const usePost = (postId, conversationId, expectedUsername) => {
  const queryClient = useQueryClient();
  const { data: filters } = useFilters();
  //const me = useAuthStore(s => s.me?.id);

  return useQuery({
    // If no conversationId, use a fallback key to avoid 'undefined' in the array
    queryKey: conversationId 
      ? ['post', postId, conversationId] 
      : ['post', postId],

    queryFn: () => fetchPost(postId),

    // 2. The Pulling Logic (Instant UI)
    initialData: () => {
      // 1. Only try to pull from context if we HAVE a conversationId
      if (conversationId) {
        const context = queryClient.getQueryData(['post', 'context', conversationId]);
        return context?.allPosts.get(postId);
      }
      
      // 2. Optional: Try to find the data in ANY existing post query 
      // (Useful if the user navigated from a different list)
      return queryClient.getQueryData(['post', postId]);
    },

    // 3. The Transformation Logic (Filters & Validation)
    // REPLACES: The 'combiner' logic from your selector
    select: (post) => {
      if (!post || !post.account) return null;

      // Username Validation
      if (expectedUsername && post.account.acct !== expectedUsername) {
        return null;
      }

      // Handle Reblog Nesting
      // If it's a reblog, the 'reblog' property is already part of the object
      const targetPost = post.reblog || post;
      
      // Filtering Logic
      //if (post.account.id !== me) {
      const filtered = checkFiltered(targetPost.search_index || '', filters);
      // }

      return {
        ...post,
        filtered,
        reblog: post.reblog || null,
      };
    },

    enabled: !!postId,
    staleTime: 1000 * 60 * 5,
  });
};

/*
interface PostItemProps {
  id: string;
  conversationId: string;
  isHighlighted?: boolean;
}
//This component remains lean because the hook handles
export const PostItem = ({ id, conversationId, isHighlighted }: PostItemProps) => {
  const { data: post, isLoading } = usePost(id, conversationId);

  if (isLoading) return <div className="skeleton">...</div>;
  if (!post) return null;

  return (
    <article className={`post ${isHighlighted ? 'active' : ''}`}>
      <header>
        <strong>{post.account.display_name}</strong>
        <span>@{post.account.acct}</span>
      </header>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
};

const Conversation = ({ id }) => {
  // 1. Fetches the whole "Book" (the context)
  const { data: thread } = useConversation(id); 

  return (
    <div>
      {thread.allPosts.map(post => (
        <PostItem 
          key={post.id} 
          id={post.id} 
          conversationId={id} // <-- 2. Parent passes its own ID down to children
        />
      ))}
    </div>
  );
};
*/

/*
Use usePost (The Original Query)
Use this hook when you need to read or display data from the server. 

    Rendering Components: Use it in a list item or detail page (like PostItem) to 
    show content to the user.
    Pre-population: Use it when you want to avoid "loading spinners" by pulling 
    data from an existing cache (like a parent conversation) via the initialData option.
    Declarative Logic: It runs automatically when the component mounts or when 
    its postId dependency changes. 
*/







