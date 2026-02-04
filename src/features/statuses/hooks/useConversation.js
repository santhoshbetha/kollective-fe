import { useQuery } from '@tanstack/react-query';
import { fetchContext } from '../api/statuses';
import { buildAncestors, buildDescendants } from '../utils/traversal';
import { statusKeys } from '@/queries/keys';

export const useConversation = (conversationId) => {
  const query = useQuery({
    // Renamed parameter to conversationId for clarity with your useStatus hook
    queryKey: statusKeys.context(conversationId), //['status', 'context', conversationId],
    queryFn: () => fetchContext(conversationId),
    staleTime: 5 * 60 * 1000,
  });

  // Derive data directly from the main query result
  // This is better than extra useQuery calls because it's cleaner and more performant
  const ancestors = query.data ? buildAncestors(conversationId, query.data.inReplyTos) : [];
  const descendants = query.data ? buildDescendants(conversationId, query.data.replies) : [];

  return { ...query, ancestors, descendants };
};

/*
//src/features/statuses/components/ConversationTree.tsx:
import { useConversation } from '../hooks/use-conversation';

export const ConversationTree = ({ statusId }: { statusId: string }) => {
  // Call the hook
  const { data, ancestors, descendants, isLoading, isError, error } = useConversation(statusId);

  if (isLoading) return <div>Loading thread...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="thread-container">
      {/* Render Ancestors *//*}
      <div className="ancestors">
        {ancestors?.map(id => <StatusItem key={id} id={id} />)}
      </div>

      {/* Render Main Status *//*}
      <div className="current-status">
        <StatusItem id={statusId} isHighlighted />
      </div>

      {/* Render Descendants */ /*}
      <div className="descendants">
        {descendants?.map(id => <StatusItem key={id} id={id} />)}
      </div>
    </div>
  );
};

*/
