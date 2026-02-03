import { z } from "zod";

/**
 * Represents a custom emoji.
 * https://docs.joinmastodon.org/entities/CustomEmoji/
 */
const customEmojiSchema = z.object({
  category: z.string().catch(""),
  shortcode: z.string(),
  static_url: z.string().url().catch(""), // Validate as URL first
  url: z.string().url(),
  visible_in_picker: z.boolean().catch(true),
}).transform((emoji) => ({
  ...emoji,
  // If static_url is empty because of the catch, use the main url
  static_url: emoji.static_url || emoji.url,
}));

export { customEmojiSchema };

