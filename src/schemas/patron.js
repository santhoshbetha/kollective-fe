import z from "zod";

const patronUserSchema = z
  .object({
    is_patron: z.boolean().catch(false),
    // Use catch to prevent a single bad URL from crashing a list
    url: z.string().url().catch(""),
  })
  .transform((patron) => ({
    ...patron,
    // ID comes second to ensure it's not accidentally overwritten
    id: patron.url,
  }));
  
export { patronUserSchema };

