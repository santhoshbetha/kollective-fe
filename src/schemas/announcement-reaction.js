import z from "zod";

const announcementReactionSchema = z.object({
  name: z.string().catch(""),
  count: z.number().int().nonnegative().catch(0),
  me: z.boolean().catch(false),
  url: z.string().url().nullable().catch(null),
  static_url: z.string().url().nullable().catch(null),
  announcement_id: z.string().catch(""),
});

// If announcement_id is actually a number in your database but sent as a string
// in the API, you can use z.coerce.string() to automatically handle both cases

// array schema to wrap these reactions, perhaps with a transformation to sort 
// them by count

const reactionsSchema = z
  .array(announcementReactionSchema)
  .catch([]) // Fallback to empty array if the entire list is malformed
  .transform((reactions) => {
    // Sort by count (descending) so popular reactions appear first
  return reactions
    .filter(r => r.name !== "") // Remove failed/empty reactions
    .sort((a, b) => b.count - a.count);
  });

/*
to ensure the list only contains reactions that actually have a name 
(avoiding empty ones from your previous .catch("")), you can add a .filter() 
to your transformation
*/

export { announcementReactionSchema, reactionsSchema };

