import { z } from 'zod';

export const authStateSchema = z.object({
  token: z.string().min(10), // Ensure it looks like a real token
  currentUser: z.object({
    id: z.string(),
    username: z.string(),
    avatar: z.string().url(),
  }).nullable(),
  expiresAt: z.number().optional(), // Useful for token refreshing
});

