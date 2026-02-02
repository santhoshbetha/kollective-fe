import axios from 'axios';
import { queryClient } from './queryClient'; // The client we built earlier
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
});

// Request Interceptor: Attach the token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle the "Nuclear Reset"
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 1. Clear the TanStack Query Cache (nuclear wipe)
      queryClient.clear();

      // 2. Clear the Zustand Auth Store (logs out user)
      useAuthStore.getState().logout();

      // 3. Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
