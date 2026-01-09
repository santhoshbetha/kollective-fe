import z from "zod";

const locationSchema = z.object({
  id: z.coerce.string(),
  name: z.string().catch(""),
  address: z.string().optional().catch(undefined),
  latitude: z.number().optional().catch(undefined),
  longitude: z.number().optional().catch(undefined),
  url: z.string().optional().catch(undefined),
});

export { locationSchema };
