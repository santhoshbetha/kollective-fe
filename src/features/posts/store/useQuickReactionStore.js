// src/features/posts/store/useQuickReactionStore.js
import { create } from 'zustand';

//Quick Reactions
//This store manages the "Press-and-Hold" state to differentiate between a simple tap (Like) and a long-press (Quick Reactions).
export const useQuickReactionStore = create((set) => ({
  activePostId: null,
  isVisible: false,
  
  show: (id) => set({ activePostId: id, isVisible: true }),
  hide: () => set({ activePostId: null, isVisible: false }),
}));
