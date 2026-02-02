import { z } from 'zod';
import { emojiReactionSchema } from './emojiSchemas';
import { reduceEmoji } from '../utils/statusUtils';
import { formatDistanceToNow } from 'date-fns';

export const statusSchema = z.object({
  id: z.string(),
  created_at: z.string(), // Keep this raw
  content: z.string(),
  favourites_count: z.number().default(0),
  favourited: z.boolean().default(false),
  reactions: z.array(emojiReactionSchema).catch([]), // Fallback to empty array if corrupt
  // Add other standard fields...
}).transform((status) => {
  // Enrichment: Automatically calculate sorted reactions for every status
  return {
    ...status,
    // Pre-calculate the combined Like + Emoji list
    enrichedReactions: reduceEmoji(
      status.reactions,
      status.favourites_count,
      status.favourited
    ),
    // Pre-calculate if I have reacted to this
    myReaction: reduceEmoji(
      status.reactions,
      status.favourites_count,
      status.favourited
    ).find(e => e.me === true),
    // NEW: Transform the ISO string into a human-readable "Time Ago" string
    timeAgo: formatDistanceToNow(new Date(status.created_at), { addSuffix: true }),
    // OPTIONAL: Transform content to remove empty paragraphs or normalize HTML
    cleanContent: status.content.trim(),
    
  };
});

/*
Now, your StatusCard doesn't need to import date libraries or perform calculations 
on every render. It simply consumes the pre-calculated timeAgo property.

const StatusCard = ({ status }) => {
  return (
    <div className="status">
      <header>
        <strong>{status.account.display_name}</strong>
        {/* Replaces: formatDistanceToNow(new Date(status.created_at)) *//*}
        <span className="timestamp">{status.timeAgo}</span>
      </header>
      <div dangerouslySetInnerHTML={{ __html: status.cleanContent }} />
    </div>
  );
};
*/
/*
const StatusCard = ({ status }) => {
  return (
    <div className="status-card">
      <header>
        <TimeAgo date={status.created_at} />
      </header>
      <div dangerouslySetInnerHTML={{ __html: status.content }} />
    </div>
  );
};
*/


import { z } from 'zod';
import { pollSchema, cardSchema } from './statusComponents';
import { accountSchema } from '@/features/accounts/schemas/accountSchemas';

export const statusSchema = z.object({
  id: z.string(),
  account: accountSchema,
  poll: pollSchema, // Automatically normalizes polls
  card: cardSchema, // Automatically normalizes cards
  content: z.string().default(''),
  // ... other fields
}).passthrough().transform((status) => {
  const out = { ...status };

  // Ported logic for Quotes (fixQuote)
  if (out.pleroma?.quote_id) {
    out.quoteId = out.pleroma.quote_id;
  }

  // Final cleanup of the complex Pleroma metadata
  out.reactions = out.pleroma?.emoji_reactions || out.emojis || [];

  return Object.freeze(out);
});

//================================================================
//Filter Highlights
// src/features/statuses/schemas/statusSchemas.js
import { getHighlightStyle } from '@/features/filters/utils/filterHelpers';

export const statusSchema = z.object({
  // ... existing fields
}).passthrough().transform((status) => {
  const out = { ...status };
  
  // Logic from previous step: Get matching filters
  const matchingFilters = out.filter_titles || [];
  
  // NEW: Assign a specific CSS class based on the filter match
  out.highlightClass = getHighlightStyle(matchingFilters);
  
  return Object.freeze(out);
});


