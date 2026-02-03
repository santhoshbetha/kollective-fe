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
import { getHighlightStyle } from "../utils/filter-helpers.js";
import { formatDistanceToNow } from 'date-fns'; // Ensure date-fns is installed
import { reduceEmoji2 } from "../utils/emoji-reacts.js";

// Helper for environment-safe DOM parsing
const getPlaintext = (html) => {
  if (typeof window === "undefined") return html.replace(/<[^>]*>?/gm, ''); // Simple fallback for SSR
  return new DOMParser().parseFromString(html, "text/html").documentElement.textContent || "";
};

const statusKollectiveSchema = z.object({
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
  kollective: statusKollectiveSchema.optional().catch(undefined),
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
  const pollOptionTitles = status.poll?.options.map(o => o.title) || [];
  const mentionedUsernames = status.mentions.map(m => `@${m.acct}`);
  
  const searchContent = [
    status.spoiler_text,
    status.content,
    ...pollOptionTitles,
    ...mentionedUsernames,
  ].join("\n\n");

  return getPlaintext(searchContent);
};

const transformStatus = (data) => {
  const { kollective, ...status } = data;
  
  // 1. [Sanitization & Content Cleanup]
  const trimmedContent = (status.content || "").trim();
  const sanitizedContent = DOMPurify.sanitize(stripCompatibilityFeatures(trimmedContent), {
    USE_PROFILES: { html: true },
  });

  // 2. [Sensitivity & Spoiler Normalization]
  let spoilerText = status.spoiler_text || "";
  if (status.sensitive && !spoilerText) {
    spoilerText = 'Sensitive Content';
  }

  // 3. [Filter & Highlight Logic]
  const matchingFilters = status.filter_titles || [];
  const isFiltered = matchingFilters.length > 0;
  if (isFiltered && !spoilerText) {
    spoilerText = `Filtered by: ${matchingFilters.join(', ')}`;
  }

  // 4. [kollective: & Quote Normalization] (New Merge)
  // Ported logic for Quotes (fixQuote)
  const quoteId = kollective?.quote_id || status.quote_id || null;
  
  // Normalize Reactions (Order: kollective: -> Kollective -> Standard Emojis)
  const reactions = kollective?.emoji_reactions || kollective?.emoji_reactions || status.reactions || [];

  // 5. [Array & Sub-object Cleanup]
  const poll = status.poll ? { ...status.poll, options: status.poll.options || [] } : null;
  const timeAgo = status.created_at 
    ? formatDistanceToNow(new Date(status.created_at), { addSuffix: true }) 
    : "";

  // 6. [Content Warning Overlays (Blur)]
  const hasMedia = (status.media_attachments || []).length > 0;
  const blurMedia = hasMedia && (status.sensitive || isFiltered);

  // Extract kollective: data without mutation
  const { event, ...remainingKollective } = kollective || {};

  const result = {
    ...status,
    content: sanitizedContent,
    spoiler_text: DOMPurify.sanitize(spoilerText),
    timeAgo,            // NEW: Computed for UI
    quoteId,            // Added from kollective: merge
    reactions,          // NEW: Normalized from kollective:
    poll,               // NEW: Normalized
    blurMedia,
    isFiltered,
    approval_status: "approval",
    expectsCard: false,
    event: event || null,
    filtered: [],
    hidden: false,
    kollective: kollective ? remainingKollective : undefined,
    highlightClass: isFiltered ? getHighlightStyle(matchingFilters) : null,
    search_index: buildSearchIndex({ ...status, content: sanitizedContent }),
    showFiltered: false,
    translation: undefined,
  };

  // Final Safety Check for UI Maps
  result.media_attachments = result.media_attachments || [];
  result.mentions = result.mentions || [];
  result.tags = result.tags || [];

  // Prevent downstream mutations as requested in your snippet
  return Object.freeze(result);
};

const embeddedStatusSchema = baseStatusSchema
  .transform(transformStatus)
  .nullable()
  .catch(null);

const statusSchema = baseStatusSchema
  .extend({
    quote: z.lazy(() => baseStatusSchema.transform(transformStatus).nullable().catch(null)),
    reblog: z.lazy(() => baseStatusSchema.transform(transformStatus).nullable().catch(null)),
    // Ensure filter_titles exists if your filtering utility adds it
    filter_titles: z.array(z.string()).optional().catch([]), //"Content Warning Overlays"
    kollective: statusKollectiveSchema
      .extend({
        quote: embeddedStatusSchema,
        emoji_reactions: filteredArray(emojiReactionSchema),
      })
      .optional()
      .catch(undefined),
  })
  .transform(({ kollective, ...status }) => {
    return {
      ...status,
      event: kollective?.event,
      quote: kollective?.quote || status.quote || null,
      reactions: kollective?.emoji_reactions || status.reactions || null,
      kollective: kollective
        ? (() => {
            const rest = { ...kollective };
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

/*
<article className={status.highlightClass}>
   {/* Status Content *//*}
</article>
*/

/*

// ABOVe WITH Reaction Enrichment logic -- check later

import { formatDistanceToNow } from 'date-fns';
import { getHighlightStyle } from '@/features/filters/utils/filterHelpers';
import { reduceEmoji } from '@/features/statuses/utils/statusHelpers'; // Ensure this is imported

const transformStatus = (data) => {
  const { "kollective:": kollectiveData, kollective, ...status } = data;

  // 1. [Sanitization & Content Normalization]
  const cleanContent = (status.content || "").trim();
  const sanitizedContent = DOMPurify.sanitize(stripCompatibilityFeatures(cleanContent), {
    USE_PROFILES: { html: true },
  });

  // 2. [Sensitivity & Spoiler Normalization]
  let spoilerText = status.spoiler_text || "";
  if (status.sensitive && !spoilerText) {
    spoilerText = 'Sensitive Content';
  }

  // 3. [Filter & Highlight Logic]
  const matchingFilters = status.filter_titles || [];
  const isFiltered = matchingFilters.length > 0;
  if (isFiltered && !spoilerText) {
    spoilerText = `Filtered by: ${matchingFilters.join(', ')}`;
  }

  // 4. [Reaction Enrichment] (New Merge)
  // Combine native emojis, kollective reactions, and kollective: reactions
  const rawReactions = kollectiveData?.emoji_reactions || kollective?.emoji_reactions || status.reactions || [];
  
  // Pre-calculate combined list (Likes + Emojis)
  const enrichedReactions = reduceEmoji2(
    rawReactions,
    status.favourites_count || 0,
    status.favourited || false
  );

  // Pre-calculate current user's reaction
  const myReaction = enrichedReactions.find(e => e.me === true) || null;

  // 5. [Time & Quote Normalization]
  const timeAgo = status.created_at 
    ? formatDistanceToNow(new Date(status.created_at), { addSuffix: true }) 
    : "";
  const quoteId = kollectiveData?.quote_id || status.quote_id || null;

  // 6. [Content Warning Overlays (Blur)]
  const hasMedia = (status.media_attachments || []).length > 0;
  const blurMedia = hasMedia && (status.sensitive || isFiltered);

  const result = {
    ...status,
    content: sanitizedContent,
    cleanContent,       // From Enrichment merge
    spoiler_text: DOMPurify.sanitize(spoilerText),
    timeAgo,            // From Enrichment merge
    quoteId,
    reactions: rawReactions,
    enrichedReactions,  // NEW: Pre-calculated combined list
    myReaction,         // NEW: Pre-calculated user state
    blurMedia,
    isFiltered,
    highlightClass: isFiltered ? getHighlightStyle(matchingFilters) : null,
    event: kollectiveData?.event || null,
    search_index: buildSearchIndex({ ...status, content: sanitizedContent }),
  };

  return Object.freeze(result);
};

// Assembly with Lazy recursion
export const statusSchema = baseStatusSchema
  .extend({
    quote: z.lazy(() => baseStatusSchema.transform(transformStatus).nullable().catch(null)),
    reblog: z.lazy(() => baseStatusSchema.transform(transformStatus).nullable().catch(null)),
    filter_titles: z.array(z.string()).optional().catch([]),
  })
  .transform(transformStatus);

*/

