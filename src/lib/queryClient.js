// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

// Initialize the client once outside of any component
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data in localStorage is considered "stale" but "available"
      gcTime: 1000 * 60 * 60 * 24, // Keep in storage for 24 hours
      //  staleTime: 1000 * 60 * 5,    // Trust offline data for 5 mins
       // Automatically refetch stale data when the window gets focus "Window Focus Refetching"
      refetchOnWindowFocus: true, 
      // If data is less than 30 seconds old, don't bother refetching on focus
      staleTime: 30000, // 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      // 1. Pause mutations until the user is back online
      networkMode: 'offlineFirst',
      // 2. Retry failed mutations 3 times (e.g., if server times out)
      retry: 3,
    },
  },
});

