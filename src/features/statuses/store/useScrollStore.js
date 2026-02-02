//Scroll Restoration
// src/features/statuses/store/useScrollStore.js
import { create } from 'zustand';

export const useScrollStore = create((set, get) => ({
  offsets: {}, // { home: 1250, community: 0 }

  setOffset: (type, value) => set((state) => ({
    offsets: { ...state.offsets, [type]: value }
  })),

  getOffset: (type) => get().offsets[type] || 0,
}));
