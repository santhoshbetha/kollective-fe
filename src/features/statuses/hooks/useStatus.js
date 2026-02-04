//status details:
// src/features/statuses/api/useStatus.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStatus } from '../api/statuses';
import { useFilters } from '@/features/filters/api/useFilters';
import { checkFiltered } from '../../filters/utils/filterHelpers';

export const useStatus = (statusId, conversationId, expectedUsername) => {
  const queryClient = useQueryClient();
  const { data: filters } = useFilters();
  //const me = useAuthStore(s => s.me?.id);

  return useQuery({
    // If no conversationId, use a fallback key to avoid 'undefined' in the array
    queryKey: conversationId 
      ? ['status', statusId, conversationId] 
      : ['status', statusId],

    queryFn: () => fetchStatus(statusId),

    // 2. The Pulling Logic (Instant UI)
    initialData: () => {
      // 1. Only try to pull from context if we HAVE a conversationId
      if (conversationId) {
        const context = queryClient.getQueryData(['status', 'context', conversationId]);
        return context?.allStatuses.get(statusId);
      }
      
      // 2. Optional: Try to find the data in ANY existing status query 
      // (Useful if the user navigated from a different list)
      return queryClient.getQueryData(['status', statusId]);
    },

    // 3. The Transformation Logic (Filters & Validation)
    // REPLACES: The 'combiner' logic from your selector
    select: (status) => {
      if (!status || !status.account) return null;

      // Username Validation
      if (expectedUsername && status.account.acct !== expectedUsername) {
        return null;
      }

      // Handle Reblog Nesting
      // If it's a reblog, the 'reblog' property is already part of the object
      const targetStatus = status.reblog || status;
      
      // Filtering Logic
      //if (status.account.id !== me) {
      const filtered = checkFiltered(targetStatus.search_index || '', filters);
      // }

      return {
        ...status,
        filtered,
        reblog: status.reblog || null,
      };
    },

    enabled: !!statusId,
    staleTime: 1000 * 60 * 5,
  });
};

/*
interface StatusItemProps {
  id: string;
  conversationId: string;
  isHighlighted?: boolean;
}
//This component remains lean because the hook handles
export const StatusItem = ({ id, conversationId, isHighlighted }: StatusItemProps) => {
  const { data: status, isLoading } = useStatus(id, conversationId);

  if (isLoading) return <div className="skeleton">...</div>;
  if (!status) return null;

  return (
    <article className={`status ${isHighlighted ? 'active' : ''}`}>
      <header>
        <strong>{status.account.display_name}</strong>
        <span>@{status.account.acct}</span>
      </header>
      <div dangerouslySetInnerHTML={{ __html: status.content }} />
    </article>
  );
};

const Conversation = ({ id }) => {
  // 1. Fetches the whole "Book" (the context)
  const { data: thread } = useConversation(id); 

  return (
    <div>
      {thread.allStatuses.map(status => (
        <StatusItem 
          key={status.id} 
          id={status.id} 
          conversationId={id} // <-- 2. Parent passes its own ID down to children
        />
      ))}
    </div>
  );
};
*/

/*
Use useStatus (The Original Query)
Use this hook when you need to read or display data from the server. 

    Rendering Components: Use it in a list item or detail page (like StatusItem) to 
    show content to the user.
    Pre-population: Use it when you want to avoid "loading spinners" by pulling 
    data from an existing cache (like a parent conversation) via the initialData option.
    Declarative Logic: It runs automatically when the component mounts or when 
    its statusId dependency changes. 
*/







