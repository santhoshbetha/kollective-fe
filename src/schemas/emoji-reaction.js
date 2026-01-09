import { z } from "zod";

import { emojiSchema } from "./utils.js";

const baseEmojiReactionSchema = z.object({
  count: z.number().nullable().catch(null),
  me: z.boolean().catch(false),
  name: emojiSchema,
  url: z.literal(undefined).catch(undefined),
});

const customEmojiReactionSchema = baseEmojiReactionSchema.extend({
  name: z.string(),
  url: z.string().url(),
});

const emojiReactionSchema = baseEmojiReactionSchema.or(
  customEmojiReactionSchema,
);

export { emojiReactionSchema };
