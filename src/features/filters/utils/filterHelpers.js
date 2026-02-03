//file handles the "Social Filtering" logic. It takes the raw Status Data and your 
// user-defined Filters to determine if a post should be hidden or collapsed.
/**
 * Core utility for checking if a status matches any active keyword filters.
 */

const escapeRegExp = (string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Creates a single optimized RegExp from an array of filter objects
 * @param {Array} filters - Array of Mastodon/Kollective filter objects
 */
export const createFilterRegex = (filters) => {
  if (!filters || filters.length === 0) return null;

  const patterns = filters.flatMap(filter =>
    filter.keywords.map(kw => {
      let expr = escapeRegExp(kw.keyword);

      if (kw.whole_word) {
        // Apply word boundaries if requested
        if (/^[\w]/.test(expr)) expr = `\\b${expr}`;
        if (/[\w]$/.test(expr)) expr = `${expr}\\b`;
      }
      return expr;
    })
  );

  return patterns.length > 0 ? new RegExp(patterns.join('|'), 'i') : null;
};

/**
 * Checks a status against active filters
 * @param {Object} status - The status to check
 * @param {Array} activeFilters - List of filters relevant to the current context (e.g. 'home')
 * @returns {Array} - Array of matching filter titles
 */
export const checkFiltered = (status, activeFilters) => {
  if (!activeFilters || activeFilters.length === 0) return [];

  // Check the main content and the spoiler text
  const searchIndex = `${status.spoiler_text}\n${status.content}`.toLowerCase();
  
  return activeFilters
    .filter(filter => {
      const regex = createFilterRegex([filter]);
      return regex && regex.test(searchIndex);
    })
    .map(filter => filter.title);
};

/**
 * Determines if a filter is currently active based on context and expiration
 */
export const isFilterActive = (filter, contextType) => {
  const now = Date.now();
  const isExpired = filter.expires_at && Date.parse(filter.expires_at) < now;
  const matchesContext = !contextType || filter.context.includes(contextType);
  
  return matchesContext && !isExpired;
};

// src/features/filters/utils/filterHelpers.js
// /Irreversible Filters
//To implement Irreversible Filters, you shift the logic from the statusSchema 
// (which transforms a single object) to the useTimeline hook (which handles the array).
//If a status matches an irreversible filter, it is physically removed from 
// the results before it ever reaches your TanStack Query cache or your components.
export const isIrreversible = (status, activeFilters) => {
  return activeFilters
    .filter(f => f.irreversible) // Only look at server-side "Irreversible" filters
    .some(f => {
      const regex = createFilterRegex([f]);
      const searchIndex = `${status.spoiler_text}\n${status.content}`.toLowerCase();
      return regex && regex.test(searchIndex);
    });
};

//=======================================================
// src/features/filters/utils/filterHelpers.js
// Filter Highlights
const HIGHLIGHT_MAP = {
  'News': 'border-blue-500 bg-blue-50',
  'Politics': 'border-orange-500 bg-orange-50',
  'Tech': 'border-green-500 bg-green-50',
};

export const getHighlightStyle = (matchingFilters) => {
  if (!matchingFilters || matchingFilters.length === 0) return null;
  
  // Find the first filter that has a defined style
  const match = matchingFilters.find(title => HIGHLIGHT_MAP[title]);
  return HIGHLIGHT_MAP[match] || 'border-gray-300'; // Fallback style
};



