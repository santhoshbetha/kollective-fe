import z from "zod";

const domainSchema = z.object({
  // coerce.string() is great here to handle numeric IDs from some backends
  id: z.coerce.string(),
  domain: z.string().toLowerCase().trim().catch(""),
  public: z.boolean().catch(false),
  resolves: z.boolean().catch(false),
  // Use a real ISO string or null for better date handling
  last_checked_at: z.string().datetime().catch(() => new Date().toISOString()),
});

export { domainSchema };

