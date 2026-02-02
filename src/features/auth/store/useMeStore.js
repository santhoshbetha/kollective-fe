import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMeStore = create()(
  persist(
    (set) => ({
      me: null, // The full Account object
      accessToken: null,

      // Actions
      setMe: (account) => set({ me: account }),
      setToken: (token) => set({ accessToken: token }),
      
      logout: () => {
        set({ me: null, accessToken: null });
        localStorage.removeItem('kollective-me-storage');
      },
    }),
    { name: 'kollective-me-storage' }
  )
);
