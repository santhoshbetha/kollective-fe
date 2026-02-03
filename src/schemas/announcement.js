import z from "zod";

import { announcementReactionSchema } from "./announcement-reaction.js";
import { customEmojiSchema } from "./custom-emoji.js";
import { mentionSchema } from "./mention.js";
import { tagSchema } from "./tag.js";
import { dateSchema, filteredArray } from "./utils.js";

const announcementSchema = z.object({
  id: z.string(),
  content: z.string().catch(""),
  starts_at: z.string().datetime().nullable().catch(null),
  ends_at: z.string().datetime().nullable().catch(null),
  all_day: z.boolean().catch(false),
  read: z.boolean().catch(false),
  published_at: dateSchema,
  reactions: filteredArray(announcementReactionSchema),
  statuses: z.preprocess((val) => {
    if (!Array.isArray(val)) return {};
    return val.reduce((acc, status) => {
      // Ensure we have a key before adding to the record
      if (status?.url) {
        acc[status.url] = status.account?.acct || "unknown";
      }
      return acc;
    }, {});
  }, z.record(z.string(), z.string()).catch({})),
  mentions: filteredArray(mentionSchema),
  tags: filteredArray(tagSchema),
  emojis: filteredArray(customEmojiSchema),
  updated_at: dateSchema,
});

// Using 'kollective:' to match your previous Account logic
const adminAnnouncementSchema = announcementSchema.extend({
  kollective: z.object({
    raw_content: z.string().catch(""),
  }).optional().catch(undefined),
});

export { announcementSchema, adminAnnouncementSchema };

