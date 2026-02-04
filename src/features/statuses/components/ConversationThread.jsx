import { useConversation } from '../hooks/useConversation';
import { StatusItem3 } from './StatusItem';
import { Spinner } from '@/components/Spinner';

function ConversationThread({ conversationId }) {
  const { ancestors, descendants, isLoading } = useConversation(conversationId);

  if (isLoading) return <Spinner />;

  return (
    <div className="thread">
      {/* 1. Map through ancestor IDs */}
      {ancestors.map((id) => (
        <StatusItem3 key={id} statusId={id} conversationId={conversationId} />
      ))}

      {/* 2. The Current Status */}
      <StatusItem3 statusId={conversationId} conversationId={conversationId} isFocused />
      
      {/* 3. Map through descendant IDs */}
      {descendants.map((id) => (
        <StatusItem3 key={id} statusId={id} conversationId={conversationId} />
      ))}
    </div>
  );
}

export default ConversationThread;
