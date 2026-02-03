import { z } from 'zod';

// Minimal Account Schema
export const accountSchema = z.object({
  id: z.string(),
  username: z.string(),
  acct: z.string(),
  display_name: z.string(),
  avatar: z.string().url(),
  header: z.string().url(),
  note: z.string(),
  followers_count: z.number().default(0),
  following_count: z.number().default(0),
  statuses_count: z.number().default(0),
  // Kollective specific metadata
  kollective: z.object({
    is_admin: z.boolean().optional(),
    is_moderator: z.boolean().optional(),
  }).optional(),
});

// Minimal Status Schema
export const statusSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  content: z.string(),
  account: accountSchema,
  favourited: z.boolean().default(false),
  reblogged: z.boolean().default(false),
  favourites_count: z.number().default(0),
  reblogs_count: z.number().default(0),
  replies_count: z.number().default(0),
  sensitive: z.boolean().default(false),
  spoiler_text: z.string().default(''),
  media_attachments: z.array(z.any()).default([]),
});

//=====================================================================
import { z } from 'zod';

export const accountSchema = z.object({
  id: z.string(),
  username: z.string(),
  acct: z.string(),
  display_name: z.string().default(''),
  locked: z.boolean().default(false),
  bot: z.boolean().default(false),
  created_at: z.string(),
  note: z.string().default(''),
  url: z.string().url(),
  avatar: z.string().url(),
  header: z.string().url(),
  followers_count: z.number().default(0),
  following_count: z.number().default(0),
  statuses_count: z.number().default(0),
  // Kollective / Mastodon Source Metadata
  source: z.object({
    note: z.string().default(''),
    fields: z.array(z.any()).default([]),
    privacy: z.string().optional(),
    sensitive: z.boolean().optional(),
  }).optional(),
  fields: z.array(z.any()).default([]),
  emojis: z.array(z.any()).default([]),
  kollective: z.object({
    is_admin: z.boolean().optional(),
    is_moderator: z.boolean().optional(),
    also_known_as: z.array(z.string()).default([]),
    relationship_until: z.string().optional(),
  }).passthrough().optional(),
}).passthrough().transform((acc) => {
  const out = { ...acc };

  // 1. Logic Port: Standardize Handle (acct vs username)
  out.full_handle = out.acct.includes('@') ? out.acct : `${out.acct}@${window.location.host}`;

  // 2. Logic Port: Merge Kollective Source (Ported from normalizeAccount meta logic)
  if (out.kollective) {
    out.is_admin = out.kollective.is_admin || false;
    out.is_moderator = out.kollective.is_moderator || false;
    out.also_known_as = out.kollective.also_known_as || [];
  }

  // 3. Cleanup HTML in Bio (Ported from fixContent)
  out.note_plain = out.note.replace(/<[^>]*>/g, '');

  // 4. Ensure Arrays exist for UI .map() safety
  out.fields = Array.isArray(out.fields) ? out.fields : [];
  out.emojis = Array.isArray(out.emojis) ? out.emojis : [];

  return Object.freeze(out);
});

/*
// src/features/accounts/api/useAccount.js
export const useAccount = (accountId) => {
  return useQuery({
    queryKey: ['accounts', accountId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/accounts/${accountId}`);
      // Validates and transforms the raw Kollective JSON into our clean Record
      return accountSchema.parse(data);
    }
  });
};
*?


