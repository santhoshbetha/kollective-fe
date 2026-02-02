// src/features/compose/store/useExpirationStore.js
import { create } from 'zustand';

//Self-Destructing Messages
export const useExpirationStore = create((set) => ({
  expireAfter: null, // null, 3600 (1hr), 86400 (1day), etc.
  
  setExpireAfter: (seconds) => set({ expireAfter: seconds }),
  reset: () => set({ expireAfter: null }),
}));
