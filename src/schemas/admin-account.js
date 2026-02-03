import z from "zod";

import { accountSchema } from "./account.js";

const adminIpSchema = z.object({
  ip: z.string().ip(),
  used_at: z.string().datetime(),
});

const adminAccountSchema = z.object({
  id: z.string(),
  account: accountSchema,
  username: z.string(),
  // Simplified: .catch(null) already handles missing/null values
  domain: z.string().catch(null),
  created_at: z.string().datetime(),
  email: z.string().email().catch(null),
  ip: z.string().ip().catch(null),
  ips: adminIpSchema.array().catch(null),
  locale: z.string().catch(null),
  invite_request: z.string().catch(null),
  role: z.string().catch(null),
  confirmed: z.boolean().catch(true),
  approved: z.boolean().catch(true),
  disabled: z.boolean().catch(false),
  silenced: z.boolean().catch(false),
  suspended: z.boolean().catch(false),
  sensitized: z.boolean().catch(false),
});

export { adminAccountSchema };

