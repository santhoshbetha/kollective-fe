import z from "zod";

const patronUserSchema = z
  .object({
    is_patron: z.boolean().catch(false),
    url: z.string().url(),
  })
  .transform((patron) => ({
    id: patron.url,
    ...patron,
  }));

export { patronUserSchema };
