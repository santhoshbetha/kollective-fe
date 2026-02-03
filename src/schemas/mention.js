import { z } from "zod";

const mentionSchema = z
  .object({
    acct: z.string(),
    id: z.string(),
    url: z.string().url().catch(""),
    username: z.string().catch(""),
  })
  .transform((mention) => ({
    ...mention,
    // Return a new object to avoid mutating 'mention'
    username: mention.username || mention.acct.split("@")[0] || "",
  }));
  
export { mentionSchema };

