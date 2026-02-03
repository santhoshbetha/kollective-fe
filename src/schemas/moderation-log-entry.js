import z from "zod";

const moderationLogEntrySchema = z.object({
  id: z.coerce.string(),
  data: z.record(z.string(), z.any()).catch({}),
  // Fallback to 'now' if time is missing or malformed
  time: z.number().catch(() => Math.floor(Date.now() / 1000)),
  message: z.string().catch(""),
});

export { moderationLogEntrySchema };

