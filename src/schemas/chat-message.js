import z from "zod";

const chatMessageSchema = z.object({
  id: z.string().catch(""),
  sender: z.string().catch(""),
  text: z.string().catch(""),
  created_at: z.string().datetime().catch(""),
  edited_at: z.string().datetime().nullable().catch(null),
  deleted: z.boolean().catch(false),
});

export { chatMessageSchema };
