import { useConversation } from '../hooks/useConversation';

export const ConversationTree = ({ statusId }) => {
  const { ancestors, descendants, isLoading } = useConversation(statusId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {ancestors.map(id => <div key={id}>Ancestor: {id}</div>)}
      <div style={{ fontWeight: 'bold' }}>Current: {statusId}</div>
      {descendants.map(id => <div key={id}>Descendant: {id}</div>)}
    </div>
  );
};
