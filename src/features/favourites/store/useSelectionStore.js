import { create } from 'zustand';

export const useSelectionStore = create((set) => ({
  selectedIds: [],
  isSelectionMode: false,

  toggleSelectionMode: () => set((state) => ({ 
    isSelectionMode: !state.isSelectionMode, 
    selectedIds: [] 
  })),

  toggleId: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter(i => i !== id)
      : [...state.selectedIds, id]
  })),

  clearSelection: () => set({ selectedIds: [], isSelectionMode: false }),
}));

//==================================================================================
//"Automatic Selection"
//To implement
//Automatic Selection (e.g., "Select all posts from the last 7 days"), you create a helper 
// function that reads the data already residing in your TanStack Query cache and pushes 
// those IDs into your Zustand selection store.
// src/features/favourites/store/useSelectionStore.js
export const useSelectionStore = create((set) => ({
  selectedIds: [],
  isSelectionMode: false,
  // ... existing actions

  selectMany: (ids) => set((state) => ({
    selectedIds: [...new Set([...state.selectedIds, ...ids])]
  })),
}));
/*

*/


