// src/features/conversations/api/useConversationActions.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/client";

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/api/v1/conversations/${id}/read`),
    onSuccess: (updatedConversation) => {
      // Update the specific conversation in the list cache to set unread: false
      queryClient.setQueryData(['conversations'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.map(conv => 
              conv.id === updatedConversation.id ? updatedConversation : conv
            )
          }))
        };
      });
    }
  });
};
//===============================================================================
// src/features/conversations/api/useConversationActions.js
export const useMarkConversationRead2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/api/v1/conversations/${id}/read`),
    
    // REPLACES: dispatch({ type: CONVERSATIONS_READ })
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      
      queryClient.setQueryData(['conversations'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.map(conv => 
              conv.id === id ? { ...conv, unread: false } : conv
            )
          }))
        };
      });
    }
  });
};
/*
Automatic since_id: Instead of manually passing since_id, TanStack Query's Refetching mechanism automatically updates the top of the list when you invalidate the query.
Memory Efficiency: The .flatMap and .map logic for accounts and statuses is now performed once during the fetch phase and saved directly into their respective TanStack caches.
No Boilerplate: You can delete expandConversationsRequest, Success, and Fail constants.
*/


