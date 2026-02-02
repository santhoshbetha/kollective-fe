import { z } from 'zod';
import { accountSchema } from '@/features/accounts/schemas/accountSchemas';

//check this later

export const statusSchema = z.object({
  id: z.string(),
  content: z.string().default(''),
  url: z.string().nullable().optional(),
  replies_count: z.number().default(0),
  reblogs_count: z.number().default(0),
  favourites_count: z.number().default(0),
  media_attachments: z.array(z.any()).default([]),
  mentions: z.array(z.any()).default([]),
  tags: z.array(z.any()).default([]),
  emojis: z.array(z.any()).default([]),
  account: accountSchema,
  pleroma: z.object({}).passthrough().optional(),
}).passthrough().transform((status) => {
  // --- LOGIC PORTED FROM normalizeStatus ---
  
  let out = { ...status };

  // 1. Fix Content & Sensitivity (Ported from fixContent/fixSensitivity)
  out.content = out.content.trim();
  if (out.sensitive && !out.spoiler_text) {
    out.spoiler_text = 'Sensitive Content';
  }

  // 2. Normalize Mentions (Ported from fixMentionsOrder/addSelfMention)
  out.mentions = Array.isArray(out.mentions) ? out.mentions : [];
  
  // 3. Normalize Pleroma Specifics (Ported from fixQuote/normalizeEmojis)
  const reactions = out.pleroma?.emoji_reactions || [];
  out.reactions = reactions.length ? reactions : (out.emojis || []);

  // 4. Polls & Cards (Ported from normPoll/normCard)
  out.poll = out.poll ? { ...out.poll, options: out.poll.options || [] } : null;

  // 5. Cleanup Arrays (Ensures .map() never fails in UI)
  out.media_attachments = Array.isArray(out.media_attachments) ? out.media_attachments : [];
  out.tags = Array.isArray(out.tags) ? out.tags : [];

  // 6. Add Computed Fields (Like TimeAgo)
  out.timeAgo = formatDistanceToNow(new Date(out.created_at), { addSuffix: true });

  // REPLACES: Object.freeze(out)
  return Object.freeze(out);
});

/*
export const useTimeline = (type) => {
  return useInfiniteQuery({
    queryKey: ['statuses', 'timeline', type],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/timelines/${type}`);
      // This single line validates AND normalizes the entire array
      return z.array(statusSchema).parse(data);
    }
  });
};
*/

//==================================================================================
//To implement this, you'll integrate the checkFiltered utility directly into your Zod Schema 
// using the .transform() function. This ensures every status is "pre-scrubbed" as 
// it enters the TanStack Query Cache, so your UI components don't have to calculate
// filtering on every render.
import { z } from 'zod';
import { queryClient } from '@/api/queryClient';
import { checkFiltered, isFilterActive } from '@/features/filters/utils/filterHelpers';

export const statusSchema = z.object({
  id: z.string(),
  content: z.string().default(''),
  spoiler_text: z.string().default(''),
  account: z.any(),
  // ... other fields
}).passthrough().transform((status) => {
  const out = { ...status };

  // 1. Get Filters from Cache (already fetched by useFilters)
  const allFilters = queryClient.getQueryData(['filters', 'list']) || [];
  
  // 2. Determine Context (e.g., 'home') 
  // You can pass context via a global Zustand store or meta tags
  const activeFilters = allFilters.filter(f => isFilterActive(f, 'home'));

  // 3. Apply Social Filtering
  const matchingFilters = checkFiltered(out, activeFilters);
  
  out.filtered = matchingFilters.length > 0;
  out.filter_titles = matchingFilters;

  // 4. Force 'Collapse' if filtered
  if (out.filtered && !out.spoiler_text) {
    out.spoiler_text = `Filtered by: ${matchingFilters.join(', ')}`;
  }

  return Object.freeze(out);
});
/*
Decoupled Logic: Your StatusCard component no longer needs to know how to filter. it simply checks if (status.filtered) and shows the "Hidden" placeholder TanStack Query Selectors.
Instant Timeline Updates: Because this runs in the queryFn, when you add a new filter and call queryClient.invalidateQueries({ queryKey: ['statuses'] }), the entire timeline is re-processed and the offending posts vanish instantly TanStack Query Invalidation.
Performance: Transforming data once at the "Edge" (API entry) is significantly more efficient than running Regex inside the React Render Loop.
*/
//================================================================
//Filter Toggle
// src/features/statuses/schemas/statusSchemas.js
import { useFilterPrefsStore } from '@/features/filters/store/useFilterPrefsStore';

export const statusSchema = z.object({
  // ... existing fields
}).passthrough().transform((status) => {
  const out = { ...status };
  const mode = useFilterPrefsStore.getState().filterMode;
  
  // Logic from filterHelpers.js
  const matchingFilters = out.filter_titles || [];
  const isFiltered = matchingFilters.length > 0;

  if (isFiltered) {
    if (mode === 'collapse') {
      out.isCollapsed = true;
      out.highlightClass = null;
    } else {
      out.isCollapsed = false;
      out.highlightClass = getHighlightStyle(matchingFilters);
    }
  }

  return Object.freeze(out);
});
//========================================================
// /Content Warning Overlays
// src/features/statuses/schemas/statusSchemas.js

export const statusSchema = z.object({
  sensitive: z.boolean().default(false),
  media_attachments: z.array(z.any()).default([]),
  // ... other fields
}).passthrough().transform((status) => {
  const out = { ...status };
  
  // Logic: Blur if poster marked sensitive OR if it matched our filters
  const hasMedia = out.media_attachments.length > 0;
  const isFiltered = out.filter_titles?.length > 0;

  // Global override: If it matched a filter, we force the blur
  out.blurMedia = hasMedia && (out.sensitive || isFiltered);

  return Object.freeze(out);
});

