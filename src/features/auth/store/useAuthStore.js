import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authStateSchema } from '../schemas/authSchema';

/*
interface AuthState {
  token: string | null;
  currentUser: any | null; // Replace with your User type
  actions: {
    login: (token: string, user: any) => void;
    logout: () => void;
  };
}
*/

export const useAuthStore = create()(
  persist(
    (set) => ({
      token: null,
      currentUser: null,
      actions: {
        login: (token, currentUser) => set({ token, currentUser }),
        logout: () => set({ token: null, currentUser: null }),
      },
    }),
    {
      name: 'auth-storage', // Saves to LocalStorage automatically
      storage: createJSONStorage(() => localStorage),
      // Only persist the token, let TanStack Query handle the user object
      partialize: (state) => ({ token: state.token }),
    }
  )
);

/*export const useAuthStore2 = create()(
  persist(
    (set) => ({
      token: null,
      currentUser: null,
      // Actions
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        set({ token: null, currentUser: null });
        localStorage.removeItem('auth-storage');
      }
    }),
    {
      name: 'auth-storage',
      // This is the "Safety Valve" for your store
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const result = authStateSchema.safeParse(state);
        
        if (!result.success) {
          console.error("Auth validation failed 33. Logging out for safety.", result.error);
          // If the data is corrupt, wipe the store
          useAuthStore.getState().logout();
        }
      },
    }
  )
);*/


// Helper selectors for better performance
export const useToken = () => useAuthStore((s) => s.token);
export const useCurrentUser = () => useAuthStore((s) => s.currentUser);
export const useAuthActions = () => useAuthStore((s) => s.actions);


/*
2. Linking Zustand with TanStack Query
Now, use the token from Zustand to authorize your TanStack Query fetches.
// src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export const api = axios.create({ baseURL: '/api/v1' });

// Add a request interceptor to inject the token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token; // Get token without a hook
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

3. The "Logout" Cleanup
When a user logs out, you must clear both the Zustand store and the TanStack Query 
cache to prevent data leaking between users.

const queryClient = useQueryClient();
const { logout } = useAuthActions();

const handleLogout = () => {
  logout(); // Clear Zustand
  queryClient.clear(); // Clear all cached tweets, profiles, and polls
  window.location.href = '/login';
};

With this setup, you can safely delete the src/reducers and src/actions 
folders from your Soapbox-style project.


*/
