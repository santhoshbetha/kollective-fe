import { useQuery } from "@tanstack/react-query";
import { chatMessageSchema } from "../../../schemas/chat-message";

const useChatHistory = (chatId) => {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await fetch(`/api/chats/${chatId}`);
      const data = await response.json();
      // Validates and fixes every message in the array
      return z.array(chatMessageSchema).parse(data);
    }
  });
};

export default useChatHistory;
