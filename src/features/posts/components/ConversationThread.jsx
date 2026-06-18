import { useConversation } from '../hooks/useConversation';
import { PostItem3 } from './PostItem';
import { Spinner } from '@/components/Spinner';

function ConversationThread({ conversationId }) {
  const { ancestors, descendants, isLoading } = useConversation(conversationId);

  if (isLoading) return <Spinner />;

  return (
    <div className="thread">
      {/* 1. Map through ancestor IDs */}
      {ancestors.map((id) => (
        <PostItem3 key={id} postId={id} conversationId={conversationId} />
      ))}

      {/* 2. The Current Post */}
      <PostItem3 postId={conversationId} conversationId={conversationId} isFocused />
      
      {/* 3. Map through descendant IDs */}
      {descendants.map((id) => (
        <PostItem3 key={id} postId={id} conversationId={conversationId} />
      ))}
    </div>
  );
}

export default ConversationThread;
