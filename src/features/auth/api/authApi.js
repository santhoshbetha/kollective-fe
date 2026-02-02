// src/features/auth/api/authApi.ts
import { api } from '@/api/client'; 
import { Account } from '@/features/accounts/types'; // Your TS interface

export const fetchCurrentUser = async () => {
  // Mastodon standard endpoint for getting the logged-in user
  const { data } = await api.get('/api/v1/accounts/verify_credentials');
  return data;
};
