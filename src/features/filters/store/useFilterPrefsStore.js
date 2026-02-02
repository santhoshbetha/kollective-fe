import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//Filter Toggle
export const useFilterPrefsStore = create()(
  persist(
    (set) => ({
      filterMode: 'collapse', // 'collapse' | 'highlight'
      setFilterMode: (mode) => set({ filterMode: mode }),
    }),
    { name: 'kollective-filter-prefs' }
  )
);
