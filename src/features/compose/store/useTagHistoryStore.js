// src/features/compose/store/useTagHistoryStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTagHistoryStore = create()(
  persist(
    (set) => ({
      history: [],
      addTags: (tags) => set((state) => {
        const names = tags.map(t => t.name);
        // Deduplicate and keep top 1000
        const newHistory = [...new Set([...names, ...state.history])].slice(0, 1000);
        return { history: newHistory };
      }),
    }),
    { name: 'kollective-tag-history' }
  )
);
//==================================================================================