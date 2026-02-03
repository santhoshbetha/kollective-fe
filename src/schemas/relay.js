import z from "zod";

const relaySchema = z
  .object({
    actor: z.string().catch(""),
    id: z.string().optional(), // Allow it to be missing before transform
    followed_back: z.boolean().catch(false),
  })
  .transform((relay) => ({
    ...relay,
    // Use actor as the ID if no ID exists, ensuring a key for React
    id: relay.id || relay.actor,
  }));
  
export { relaySchema };

