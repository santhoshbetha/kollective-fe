// src/features/statuses/store/useQuickReactionStore.js
import { create } from 'zustand';

//Quick Reactions
//This store manages the "Press-and-Hold" state to differentiate between a simple tap (Like) and a long-press (Quick Reactions).
export const useQuickReactionStore = create((set) => ({
  activeStatusId: null,
  isVisible: false,
  
  show: (id) => set({ activeStatusId: id, isVisible: true }),
  hide: () => set({ activeStatusId: null, isVisible: false }),
}));
