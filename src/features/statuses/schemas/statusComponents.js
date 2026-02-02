import { z } from 'zod';

// Ported from normPoll
export const pollSchema = z.object({
  id: z.string(),
  expires_at: z.string().nullable(),
  expired: z.boolean().default(false),
  multiple: z.boolean().default(false),
  votes_count: z.number().default(0),
  voted: z.boolean().default(false),
  options: z.array(z.object({
    title: z.string(),
    votes_count: z.number().default(0)
  })).default([]),
}).nullable().default(null);

// Ported from normCard
export const cardSchema = z.object({
  url: z.string().url(),
  title: z.string().default(''),
  description: z.string().default(''),
  type: z.string().default('link'),
  image: z.string().nullable().optional(),
  embed_url: z.string().optional(),
}).nullable().default(null);
