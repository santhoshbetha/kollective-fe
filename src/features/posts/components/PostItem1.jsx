import DOMPurify from 'dompurify';
import { usePost } from '../api/usePost';

export const PostItem = ({ id, conversationId, isHighlighted }) => {
  const { data: post, isLoading } = usePost(id, conversationId);

  if (isLoading) return <div className="skeleton">...</div>;
  if (!post) return null;

  // Sanitize the HTML string to remove potential XSS vulnerabilities
  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <article className={`post ${isHighlighted ? 'active' : ''}`}>
      <header>
        <strong>{post.account.display_name}</strong>
        <span>@{post.account.acct}</span>
      </header>
      {/* Use the sanitized version here */}
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    </article>
  );
};


/*Alternate way:
 Way to use React Context to avoid passing conversationId as a prop to PostItem entirely:

 1) //src/context/ConversationContext.tsx
 import { createContext, useContext } from 'react';

const ConversationContext = createContext<string | undefined>(undefined);

// A custom hook to make using the ID easier and safer
export const useConversationId = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversationId must be used within a ConversationProvider");
  }
  return context;
};

export const ConversationProvider = ConversationContext.Provider;

// 2) /ConversationPage
export const ConversationPage = () => {
  const { conversationId } = useParams(); // Get it once from the URL

  return (
    <ConversationProvider value={conversationId}>
      <div className="thread-container">
        {/* We no longer pass conversationId to PostItem! *//*}
        {postIds.map(id => <PostItem key={id} id={id} />)}
      </div>
    </ConversationProvider>
  );
};

//3) usePost hook
export const usePost = (postId) => {
  const queryClient = useQueryClient();
  const conversationId = useConversationId(); // Grab the ID from Context automatically

  return useQuery({
    queryKey: ['post', postId, { conversationId }],
    queryFn: () => fetchPost(postId),
    initialData: () => {
      const context = queryClient.getQueryData(['post', 'context', conversationId]);
      return context?.allPosts.get(postId);
    },
  });
};

4) PostItem.jsx
// Clean and simple: no conversationId prop needed!
export const PostItem = ({ id, isHighlighted }: PostItemProps) => {
  const { data: post, isLoading } = usePost(id); 

  if (isLoading) return <div className="skeleton" />;
  // ... rest of your rendering logic
};



*/