import { z } from "zod";

const tombstoneSchema = z.object({
  reason: z.enum(["deleted"]),
});

export { tombstoneSchema };
