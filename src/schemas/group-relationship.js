import z from "zod";

import { GroupRoles } from "./group-member.js";

const groupRelationshipSchema = z.object({
  id: z.string(),
  blocked_by: z.boolean().catch(false),
  // Added 'blocking' if it exists in your API
  blocking: z.boolean().catch(false), 
  member: z.boolean().catch(false),
  // Simplified: treat null or missing as 'false' for UI toggles
  muting: z.boolean().catch(false),
  notifying: z.boolean().catch(false),
  pending_requests: z.boolean().catch(false),
  requested: z.boolean().catch(false),
  role: z.nativeEnum(GroupRoles).catch(GroupRoles.USER),
});

export { groupRelationshipSchema };

