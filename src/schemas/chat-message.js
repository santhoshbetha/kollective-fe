import z from "zod";

const chatMessageSchema = z.object({
  id: z.string().catch(() => crypto.randomUUID()), // Safe for React keys
  sender: z.string().catch("Unknown"),
  text: z.string().catch(""),
  created_at: z.string().datetime().catch(() => new Date().toISOString()),
  edited_at: z.string().datetime().nullable().catch(null),
  deleted: z.boolean().catch(false),
});

export { chatMessageSchema };

