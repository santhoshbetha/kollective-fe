
import { create } from 'zustand';

// /Bulk Unmute
export const useDomainSelectionStore = create((set) => ({
  selectedDomains: [],
  
  toggleDomain: (domain) => set((state) => ({
    selectedDomains: state.selectedDomains.includes(domain)
      ? state.selectedDomains.filter(d => d !== domain)
      : [...state.selectedDomains, domain]
  })),

  clearSelection: () => set({ selectedDomains: [] }),
}));

//=======================================================
// /Automatic Domain Selection
// src/features/filters/store/useDomainSelectionStore.js
export const useDomainSelectionStore = create((set) => ({
  selectedDomains: [],
  // ... toggleDomain logic
  
  selectMany: (domains) => set((state) => ({
    selectedDomains: [...new Set([...state.selectedDomains, ...domains])]
  })),
  
  clearSelection: () => set({ selectedDomains: [] }),
}));

