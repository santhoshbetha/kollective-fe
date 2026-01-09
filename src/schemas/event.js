import z from "zod";

import { attachmentSchema } from "./attachment.js";
import { locationSchema } from "./location.js";

const eventSchema = z.object({
  name: z.string().catch(""),
  start_time: z.string().datetime().nullable().catch(null),
  end_time: z.string().datetime().nullable().catch(null),
  join_mode: z.enum(["free", "restricted", "invite"]).nullable().catch(null),
  participants_count: z.number().catch(0),
  location: locationSchema.nullable().catch(null),
  join_state: z.enum(["pending", "reject", "accept"]).nullable().catch(null),
  banner: attachmentSchema.nullable().catch(null),
  links: z.array(attachmentSchema).nullable().catch(null),
});

export { eventSchema };
