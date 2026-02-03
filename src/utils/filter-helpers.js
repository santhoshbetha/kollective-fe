/**
 * Maps matching filter titles to a specific CSS class for the UI.
 * @param {string[]} matchingFilters - Array of filter titles that matched the status.
 * @returns {string|null} - The CSS class name to apply.
 */
export const getHighlightStyle = (matchingFilters) => {
  if (!matchingFilters || matchingFilters.length === 0) return null;

  // Example: If any filter is 'NSFW', give it a specific alert style
  if (matchingFilters.some(f => f.toLowerCase().includes('nsfw'))) {
    return 'status-highlight-danger';
  }

  // Default highlight for any matched filter
  return 'status-highlight-warning';
};
