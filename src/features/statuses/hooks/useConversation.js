import { useQuery } from '@tanstack/react-query';
import { fetchContext } from '../api/fetch-context';
import { buildAncestors, buildDescendants } from '../utils/traversal';

export const useConversation = (statusId) => {
  const query = useQuery({
    queryKey: ['statusContext', statusId],
    queryFn: () => fetchContext(statusId),
    staleTime: 5 * 60 * 1000, // Optional: cache for 5 minutes
  });

  // Derive Ancestors
  const ancestors = useQuery({
    queryKey: ['statusContext', statusId],
    enabled: false, // Don't fetch; just a "virtual" query for selection
    select: (data) => buildAncestors(statusId, data.inReplyTos),
  }).data;

  // Derive Descendants
  const descendants = useQuery({
    queryKey: ['statusContext', statusId],
    enabled: false,
    select: (data) => buildDescendants(statusId, data.replies),
  }).data;

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
