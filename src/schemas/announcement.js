import z from "zod";

import { announcementReactionSchema } from "./announcement-reaction.js";
import { customEmojiSchema } from "./custom-emoji.js";
import { mentionSchema } from "./mention.js";
import { tagSchema } from "./tag.js";
import { dateSchema, filteredArray } from "./utils.js";

// https://docs.joinmastodon.org/entities/announcement/
const announcementSchema = z.object({
  id: z.string(),
  content: z.string().catch(""),
  starts_at: z.string().datetime().nullable().catch(null),
  ends_at: z.string().datetime().nullable().catch(null),
  all_day: z.boolean().catch(false),
  read: z.boolean().catch(false),
  published_at: dateSchema,
  reactions: filteredArray(announcementReactionSchema),
  statuses: z.preprocess(
    (statuses) =>
      Array.isArray(statuses)
        ? Object.fromEntries(
            statuses.map((status) => [status.url, status.account?.acct]) || [],
          )
        : statuses,
    z.record(z.string(), z.string()),
  ),
  mentions: filteredArray(mentionSchema),
  tags: filteredArray(tagSchema),
  emojis: filteredArray(customEmojiSchema),
  updated_at: dateSchema,
});

const adminAnnouncementSchema = announcementSchema.extend({
  pleroma: z.object({
    raw_content: z.string().catch(""),
  }),
});

export { announcementSchema, adminAnnouncementSchema };
