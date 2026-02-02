// src/features/lists/store/useListSelectionStore.js
import { create } from 'zustand';

//"Multi-Account Add"

//To implement Multi-Account Add, you combine a Zustand selection store with a 
// TanStack Mutation that processes the IDs in parallel. Since the Mastodon API 
// only accepts arrays for adding, but doesn't have a "Bulk Add to Multiple Lists" 
// endpoint, we handle the orchestration in the mutationFn.
export const useListSelectionStore = create((set) => ({
  selectedAccountIds: [],
  
  toggleAccount: (id) => set((state) => ({
    selectedAccountIds: state.selectedAccountIds.includes(id)
      ? state.selectedAccountIds.filter(i => i !== id)
      : [...state.selectedAccountIds, id]
  })),

  clearSelection: () => set({ selectedAccountIds: [] }),
}));
