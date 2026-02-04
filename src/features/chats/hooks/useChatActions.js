// src/features/chats/api/useChatActions.js
export const useChatActions = (chatId) => {
  const queryClient = useQueryClient();

  // Send Message
  const sendMessage = useMutation({
    mutationFn: (content) => api.post(`/api/v1/kollective/chats/${chatId}/messages`, { content }),
    onSuccess: () => {
      // Invalidate messages so the new one appears immediately
      queryClient.invalidateQueries({ queryKey: ['chats', 'messages', chatId] });
      // Also update the chat list to show the latest snippet
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] });
    }
  });

  // Mark Chat as Read
  const markRead = useMutation({
    mutationFn: (lastId) => api.post(`/api/v1/kollective/chats/${chatId}/read`, { last_id: lastId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats', 'list'] }),
  });

  return { sendMessage, markRead };
};

//================================================================================================
// src/features/chats/api/useChatActions.js
export const useChatActions = (chatId) => {
  const queryClient = useQueryClient();

  // Send Message (Replaces sendChatMessage)
  const send = useMutation({
    mutationFn: (params) => api.post(`/api/v1/kollective/chats/${chatId}/messages`, params),
    onMutate: async (params) => {
      // Optimistic logic using that '末_' UUID if needed for UI tracking
      const tempId = `末_${Date.now()}`;
      // Update cache...
      return { tempId };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats', 'messages', chatId] })
  });

  // Mark Read (Replaces markChatRead)
  const markRead = useMutation({
    mutationFn: (lastReadId) => api.post(`/api/v1/kollective/chats/${chatId}/read`, { last_read_id: lastReadId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })
  });

  return { send, markRead };
};
//================================================================================================
// src/features/chats/api/useChatActions.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useDeleteChatMessage = (chatId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. API Call
    mutationFn: (messageId) => 
      api.delete(`/api/v1/kollective/chats/${chatId}/messages/${messageId}`),

    // 2. Optimistic Update (The "Instant Vanish")
    onMutate: async (messageId) => {
      // Cancel background refetches for this chat's messages
      await queryClient.cancelQueries({ queryKey: ['chats', 'messages', chatId] });

      // Snapshot the current messages (for rollback)
      const previousMessages = queryClient.getQueryData(['chats', 'messages', chatId]);

      // Remove the message from the infinite query pages
      queryClient.setQueryData(['chats', 'messages', chatId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => 
            page.filter((msg) => msg.id !== messageId)
          ),
        };
      });

      return { previousMessages };
    },

    // 3. Rollback on failure
    onError: (err, messageId, context) => {
      queryClient.setQueryData(['chats', 'messages', chatId], context.previousMessages);
      toast.error("Failed to delete message.");
    },

    // 4. Sync List Cache
    onSuccess: () => {
      // Refresh the main chat list to update the 'last message' snippet
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] });
    },
  });
};
/*
const ChatMessage = ({ message, chatId }) => {
  const { mutate: deleteMsg, isPending } = useDeleteChatMessage(chatId);

  return (
    <div className={`message-bubble ${isPending ? 'opacity-50' : ''}`}>
      <p>{message.content}</p>
      {message.me && (
        <button 
          onClick={() => deleteMsg(message.id)} 
          disabled={isPending}
          title="Delete Message"
        >
          🗑️
        </button>
      )}
    </div>
  );

*/
//================================================================================================
//Optimistic Message Retries
// src/features/chats/api/useChatActions.js

export const useSendChatMessage = (chatId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => api.post(`/api/v1/kollective/chats/${chatId}/messages`, params),
    
    // 1. Optimistic Prepend
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: ['chats', 'messages', chatId] });
      const previous = queryClient.getQueryData(['chats', 'messages', chatId]);

      const tempId = `temp_${Date.now()}`;
      const newMessage = {
        id: tempId,
        content: params.content,
        me: true,
        sending: true, // Local flag for spinner
        failed: false,
      };

      queryClient.setQueryData(['chats', 'messages', chatId], (old) => ({
        ...old,
        pages: old.pages.map((page, i) => i === 0 ? [newMessage, ...page] : page)
      }));

      return { previous, tempId };
    },

    // 2. Failure Handling: Mark as "Failed" instead of deleting
    onError: (err, params, context) => {
      queryClient.setQueryData(['chats', 'messages', chatId], (old) => ({
        ...old,
        pages: old.pages.map(page => page.map(msg => 
          msg.id === context.tempId ? { ...msg, sending: false, failed: true } : msg
        ))
      }));
    },

    // 3. Success: Replace temp with real server data
    onSuccess: (serverMsg, params, context) => {
      queryClient.setQueryData(['chats', 'messages', chatId], (old) => ({
        ...old,
        pages: old.pages.map(page => page.map(msg => 
          msg.id === context.tempId ? serverMsg : msg
        ))
      }));
    }
  });
};
/*
const ChatMessage = ({ message, chatId }) => {
  const { mutate: sendMessage } = useSendChatMessage(chatId);

  return (
    <div className={`msg ${message.failed ? 'is-failed' : ''}`}>
      <p>{message.content}</p>
      
      {message.failed && (
        <div className="retry-area">
          <span>Failed to send</span>
          <button onClick={() => sendMessage({ content: message.content })}>
            🔄 Retry
          </button>
        </div>
      )}
      
      {message.sending && <small>Sending...</small>}
    </div>
  );
};
Zero Data Loss: Even if the server is down, the user's message is visible and "stuck" in the list until they either retry or refresh.
No Redux UUID Logic: Your old chatsSlice used crypto.randomUUID() and complex 末_ prefixes. Here, the tempId is managed locally in the TanStack Query Mutation Context.
Background Resilience: If you combine this with the Offline Support we built earlier, the "failed" message will automatically try to send again the moment the user comes back online.
*/
//================================================================================================