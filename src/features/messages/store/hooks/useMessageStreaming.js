// src/features/messages/hooks/useMessageStreaming.js
import { useEffect } from 'react';
import { useTypingStore } from '../store/useTypingStore';

//Real-time Typing Indicators
export const useMessageStreaming = (accessToken) => {
  const setTyping = useTypingStore((s) => s.setTyping);

  useEffect(() => {
    if (!accessToken) return;

    // Connect to Kollective User Stream
    const ws = new WebSocket(`${process.env.VITE_WS_URL}/api/v1/streaming?access_token=${accessToken}&stream=user`);

    ws.onmessage = (e) => {
      const { event, payload } = JSON.parse(e.data);
      
      // Kollective-specific typing event
      if (event === 'kollective:typing') {
        const data = JSON.parse(payload); // { conversation_id, account_id, typing }
        setTyping(data.conversation_id, data.account_id, data.typing);
      }
    };

    return () => ws.close();
  }, [accessToken, setTyping]);
};

/*
const TypingIndicator = ({ conversationId }) => {
  const typingIds = useTypingStore((s) => s.typingUsers[conversationId] || []);
  const { data: accounts } = useAccountLookup(typingIds); // Pull account names from cache

  if (typingIds.length === 0) return null;

  return (
    <div className="typing-indicator animate-pulse">
      {typingIds.length === 1 
        ? `${accounts?.[0]?.display_name} is typing...` 
        : "Several people are typing..."}
    </div>
  );
};

*/
