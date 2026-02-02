import { z } from 'zod';

export const relationshipSchema = z.object({
  id: z.string(),
  following: z.boolean().default(false),
  followed_by: z.boolean().default(false),
  blocking: z.boolean().default(false),
  blocked_by: z.boolean().default(false),
  muting: z.boolean().default(false),
  muting_notifications: z.boolean().default(false),
  requested: z.boolean().default(false),
  domain_blocking: z.boolean().default(false),
  showing_reblogs: z.boolean().default(true),
  endorsed: z.boolean().default(false),
  // Pleroma-specific: relationship expiration
  pleroma: z.object({
    relationship_until: z.string().nullable().optional(),
  }).passthrough().optional(),
}).passthrough().transform((rel) => {
  const out = { ...rel };

  // Logic Port: Computed state for "Pending"
  out.is_pending = out.requested || false;

  // Logic Port: Handle Pleroma-specific expiration dates
  if (out.pleroma?.relationship_until) {
    out.expires_at = out.pleroma.relationship_until;
  }

  return Object.freeze(out);
});
