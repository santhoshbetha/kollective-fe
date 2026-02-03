import { z } from "zod";

const relationshipSchema = z.object({
  id: z.string(),
  following: z.boolean().catch(false),
  followed_by: z.boolean().catch(false),
  blocking: z.boolean().catch(false),
  blocked_by: z.boolean().catch(false),
  domain_blocking: z.boolean().catch(false),
  endorsed: z.boolean().catch(false),
  muting: z.boolean().catch(false),
  muting_notifications: z.boolean().catch(false),
  // Handle case where server sends null for a note
  note: z.string().catch(""), 
  notifying: z.boolean().catch(false),
  requested: z.boolean().catch(false),
  // Essential for filtering the 'Home' feed
  showing_reblogs: z.boolean().catch(true), 
  subscribing: z.boolean().catch(false),
  requested_by: z.boolean().catch(false),
});

export { relationshipSchema };

