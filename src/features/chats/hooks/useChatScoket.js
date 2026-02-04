import { useQueryClient } from "@tanstack/react-query";
import { chatMessageSchema } from "./schemas/chat-message.schema.js";

const useChatSocket = (chatId) => {
  const queryClient = useQueryClient();

  const handleIncomingMessage = (payload) => {
    // 1. Validate the raw WebSocket data immediately
    const result = chatMessageSchema.safeParse(payload);

    if (!result.success) {
      console.error("Invalid socket message:", result.error);
      return;
    }

    const newMessage = result.data;

    // 2. Update the TanStack Query cache
    queryClient.setQueryData(['chat', chatId], (oldData) => {
      if (!oldData) return [newMessage];
      
      // Prevent duplicates if the message already exists (e.g. from a race condition)
      if (oldData.some(m => m.id === newMessage.id)) return oldData;

      return [...oldData, newMessage];
    });
  };

  // Attach this to your socket.on('message', ...) handler
  return { handleIncomingMessage };
};
