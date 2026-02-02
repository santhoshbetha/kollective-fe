// src/features/messages/store/useTypingStore.js
import { create } from 'zustand';

//Real-time Typing Indicators
export const useTypingStore = create((set) => ({
  typingUsers: {}, // { conversationId: [accountId, accountId] }

  setTyping: (conversationId, accountId, isTyping) => set((state) => {
    const current = state.typingUsers[conversationId] || [];
    const updated = isTyping 
      ? [...new Set([...current, accountId])] 
      : current.filter(id => id !== accountId);
    
    return {
      typingUsers: { ...state.typingUsers, [conversationId]: updated }
    };
  }),
}));
