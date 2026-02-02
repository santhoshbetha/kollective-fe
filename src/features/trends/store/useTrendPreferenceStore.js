import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTrendPreferenceStore = create()(
  persist(
    (set) => ({
      hiddenCategories: [],
      
      toggleCategory: (category) => set((state) => ({
        hiddenCategories: state.hiddenCategories.includes(category)
          ? state.hiddenCategories.filter(c => c !== category)
          : [...state.hiddenCategories, category]
      })),
    }),
    { name: 'kollective-trend-preferences' }
  )
);
