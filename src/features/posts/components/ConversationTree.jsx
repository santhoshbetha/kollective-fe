import { useConversation } from '../hooks/useConversation';

export const ConversationTree = ({ postId }) => {
  const { ancestors, descendants, isLoading } = useConversation(postId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {ancestors.map(id => <div key={id}>Ancestor: {id}</div>)}
      <div style={{ fontWeight: 'bold' }}>Current: {postId}</div>
      {descendants.map(id => <div key={id}>Descendant: {id}</div>)}
    </div>
  );
};
