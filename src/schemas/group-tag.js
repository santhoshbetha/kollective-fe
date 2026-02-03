import z from "zod";

const groupTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Ensure numeric fields always return 0 on failure/missing
  groups: z.number().catch(0),
  uses: z.number().catch(0),
  url: z.string().url().optional().catch(undefined),
  pinned: z.boolean().catch(false),
  // Handle both null and undefined, defaulting to true
  visible: z.boolean().nullish().transform(v => v ?? true),
});

export { groupTagSchema };

