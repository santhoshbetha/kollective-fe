import DOMPurify from 'dompurify';
import { useStatus } from '../api/useStatus';

export const StatusItem = ({ id, conversationId, isHighlighted }) => {
  const { data: status, isLoading } = useStatus(id, conversationId);

  if (isLoading) return <div className="skeleton">...</div>;
  if (!status) return null;

  // Sanitize the HTML string to remove potential XSS vulnerabilities
  const sanitizedContent = DOMPurify.sanitize(status.content);

  return (
    <article className={`status ${isHighlighted ? 'active' : ''}`}>
      <header>
        <strong>{status.account.display_name}</strong>
        <span>@{status.account.acct}</span>
      </header>
      {/* Use the sanitized version here */}
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    </article>
  );
};


/*Alternate way:
 Way to use React Context to avoid passing conversationId as a prop to StatusItem entirely:

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
        {/* We no longer pass conversationId to StatusItem! *//*}
        {statusIds.map(id => <StatusItem key={id} id={id} />)}
      </div>
    </ConversationProvider>
  );
};

//3) useStatus hook
export const useStatus = (statusId) => {
  const queryClient = useQueryClient();
  const conversationId = useConversationId(); // Grab the ID from Context automatically

  return useQuery({
    queryKey: ['status', statusId, { conversationId }],
    queryFn: () => fetchStatus(statusId),
    initialData: () => {
      const context = queryClient.getQueryData(['status', 'context', conversationId]);
      return context?.allStatuses.get(statusId);
    },
  });
};

4) StatusItem.jsx
// Clean and simple: no conversationId prop needed!
export const StatusItem = ({ id, isHighlighted }: StatusItemProps) => {
  const { data: status, isLoading } = useStatus(id); 

  if (isLoading) return <div className="skeleton" />;
  // ... rest of your rendering logic
};



*/