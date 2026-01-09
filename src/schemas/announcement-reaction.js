import z from "zod";

const announcementReactionSchema = z.object({
  name: z.string().catch(""),
  count: z.number().int().nonnegative().catch(0),
  me: z.boolean().catch(false),
  url: z.string().nullable().catch(null),
  static_url: z.string().nullable().catch(null),
  announcement_id: z.string().catch(""),
});

export { announcementReactionSchema };
