import { z } from "zod";

const emojiSchema = z.string().refine((v) => 
  /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]{2}/u.test(v)
);

// Define Base Emoji (Native Unicode)
const baseEmojiReactionSchema = z.object({
  count: z.number().nullable().catch(null),
  me: z.boolean().catch(false),
  name: emojiSchema,
  url: z.undefined().optional(),
});

// Define Custom Emoji (Remote URL)
const customEmojiReactionSchema = z.object({
  count: z.number().nullable().catch(null),
  me: z.boolean().catch(false),
  name: z.string(), // Shortcode like :blob_cat:
  url: z.string().url(),
});

// Combine using a union
// We check custom first because it has a more specific requirement (a URL)
const emojiReactionSchema = z.union([
  customEmojiReactionSchema,
  baseEmojiReactionSchema,
]);

export { emojiReactionSchema };

