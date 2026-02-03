// src/features/chats/utils/chatLauncher.js
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/client";


export const useLaunchChat = () => {
  const queryClient = useQueryClient();
  const openChat = useChatUIStore(s => s.openChat);
  
  return async (accountId, router) => {
    // 1. startChat mutation
    const chat = await api.post(`/api/v1/kollective/chats/by-account-id/${accountId}`).then(res => res.data);
    
    // 2. Cache it
    queryClient.setQueryData(['chats', 'detail', chat.id], chat);

    // 3. Mobile vs Desktop logic
    if (window.innerWidth <= 1190) {
      router.push(`/chats/${chat.id}`);
    } else {
      openChat(chat.id);
    }
  };
};

