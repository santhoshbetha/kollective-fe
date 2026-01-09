import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";

import { htmlToPlaintext, stripCompatibilityFeatures } from "../utils/html.js";

import { accountSchema } from "./account.js";
import { attachmentSchema } from "./attachment.js";
import { cardSchema } from "./card.js";
import { customEmojiSchema } from "./custom-emoji.js";
import { emojiReactionSchema } from "./emoji-reaction.js";
import { eventSchema } from "./event.js";
import { groupSchema } from "./group.js";
import { mentionSchema } from "./mention.js";
import { pollSchema } from "./poll.js";
import { tagSchema } from "./tag.js";
import { contentSchema, dateSchema, filteredArray } from "./utils.js";

const statusPleromaSchema = z.object({
  event: eventSchema.nullish().catch(undefined),
  quote: z.literal(null).catch(null),
  quote_visible: z.boolean().catch(true),
});

const baseStatusSchema = z.object({
  account: accountSchema,
  application: z
    .object({
      name: z.string(),
      website: z.string().url().nullable().catch(null),
    })
    .nullable()
    .catch(null),
  bookmarked: z.coerce.boolean(),
  card: cardSchema.nullable().catch(null),
  content: contentSchema,
  created_at: dateSchema,
  disliked: z.coerce.boolean(),
  dislikes_count: z.number().catch(0),
  edited_at: z.string().datetime().nullable().catch(null),
  emojis: filteredArray(customEmojiSchema),
  favourited: z.coerce.boolean(),
  favourites_count: z.number().catch(0),
  group: groupSchema.nullable().catch(null),
  in_reply_to_account_id: z.string().nullable().catch(null),
  in_reply_to_id: z.string().nullable().catch(null),
  id: z.string(),
  language: z.string().nullable().catch(null),
  media_attachments: filteredArray(attachmentSchema),
  mentions: filteredArray(mentionSchema),
  muted: z.coerce.boolean(),
  pinned: z.coerce.boolean(),
  pleroma: statusPleromaSchema.optional().catch(undefined),
  reactions: filteredArray(emojiReactionSchema),
  poll: pollSchema.nullable().catch(null),
  quote: z.literal(null).catch(null),
  quotes_count: z.number().catch(0),
  reblog: z.literal(null).catch(null),
  reblogged: z.coerce.boolean(),
  reblogs_count: z.number().catch(0),
  replies_count: z.number().catch(0),
  sensitive: z.coerce.boolean(),
  spoiler_text: contentSchema,
  tags: filteredArray(tagSchema),
  tombstone: z
    .object({
      reason: z.enum(["deleted"]),
    })
    .nullable()
    .optional()
    .catch(undefined),
  uri: z.string().url().catch(""),
  url: z.string().url().catch(""),
  visibility: z.string().catch("public"),
  zapped: z.coerce.boolean(),
  zaps_amount: z.number().catch(0),
});

const buildSearchIndex = (status) => {
  const pollOptionTitles = status.poll
    ? status.poll.options.map(({ title }) => title)
    : [];
  const mentionedUsernames = status.mentions.map(({ acct }) => `@${acct}`);

  const fields = [
    status.spoiler_text,
    status.content,
    ...pollOptionTitles,
    ...mentionedUsernames,
  ];

  const searchContent = htmlToPlaintext(fields.join("\n\n")) || "";
  return (
    new DOMParser().parseFromString(searchContent, "text/html").documentElement
      .textContent || ""
  );
};

const transformStatus = ({ pleroma, ...status }) => {
  return {
    ...status,
    approval_status: "approval",
    content: DOMPurify.sanitize(stripCompatibilityFeatures(status.content), {
      USE_PROFILES: { html: true },
    }),
    expectsCard: false,
    event: pleroma?.event,
    filtered: [],
    hidden: false,
    pleroma: pleroma
      ? (() => {
          const rest = { ...pleroma };
          delete rest.event;
          return rest;
        })()
      : undefined,
    search_index: buildSearchIndex(status),
    showFiltered: false,
    translation: undefined,
  };
};

const embeddedStatusSchema = baseStatusSchema
  .transform(transformStatus)
  .nullable()
  .catch(null);

const statusSchema = baseStatusSchema
  .extend({
    quote: embeddedStatusSchema,
    reblog: embeddedStatusSchema,
    pleroma: statusPleromaSchema
      .extend({
        quote: embeddedStatusSchema,
        emoji_reactions: filteredArray(emojiReactionSchema),
      })
      .optional()
      .catch(undefined),
  })
  .transform(({ pleroma, ...status }) => {
    return {
      ...status,
      event: pleroma?.event,
      quote: pleroma?.quote || status.quote || null,
      reactions: pleroma?.emoji_reactions || status.reactions || null,
      pleroma: pleroma
        ? (() => {
            const rest = { ...pleroma };
            delete rest.event;
            delete rest.quote;
            delete rest.emoji_reactions;
            return rest;
          })()
        : undefined,
    };
  })
  .transform(transformStatus);

export { statusSchema };
