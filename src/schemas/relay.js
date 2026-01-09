import z from "zod";

const relaySchema = z.preprocess(
  (data) => ({ id: data.actor, ...data }),
  z.object({
    actor: z.string().catch(""),
    id: z.string(),
    followed_back: z.boolean().catch(false),
  }),
);

export { relaySchema };
