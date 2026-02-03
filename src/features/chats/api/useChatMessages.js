import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../../../api/client";

export const useChatMessages = (chatId) => {
  return useInfiniteQuery({
    queryKey: ['chats', chatId, 'messages'],
    queryFn: ({ pageParam }) => 
      api.get(`/api/v1/kollective/chats/${chatId}/messages`, { params: { max_id: pageParam } }).then(res => res.data),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,
    enabled: !!chatId,
    refetchInterval: 5000, // Poll every 5s for new messages
  });
};

export const useChatMessages2 = (chatId) => {
  return useInfiniteQuery({
    queryKey: ['chats', 'messages', chatId],
    queryFn: ({ pageParam }) => 
      api.get(`/api/v1/kollective/chats/${chatId}/messages`, { 
        params: { max_id: pageParam, limit: 20 } 
      }).then(res => res.data),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,
    enabled: !!chatId,
    // Real-time feel: poll for new messages every 5 seconds
    refetchInterval: 5000,
  });
};

