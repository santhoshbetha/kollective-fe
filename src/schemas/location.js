import z from "zod";

const locationSchema = z.object({
  id: z.coerce.string(),
  name: z.string().trim().catch(""),
  address: z.string().trim().optional().catch(undefined),
  // Latitude is -90 to 90
  latitude: z.number().min(-90).max(90).optional().catch(undefined),
  // Longitude is -180 to 180
  longitude: z.number().min(-180).max(180).optional().catch(undefined),
  url: z.string().url().optional().catch(undefined),
});

export { locationSchema };

