import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global Defaults
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // Keep in garbage collection for 24 hours
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Ensure mutations aren't retried by default (prevents double posts)
      retry: false,
    },
  },
});

// Setup Persister (Optional: saves cache to LocalStorage)
export const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'KOLLECTIVE_OFFLINE_CACHE',
});

//check this later, defined in another file as well