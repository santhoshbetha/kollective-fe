// src/features/filters/utils/filterEngine.js
export const getActiveFilters = (filters, contextType) => {
  const now = Date.now();
  return filters.filter(f => 
    (!contextType || f.context.includes(contextType)) &&
    (!f.expires_at || Date.parse(f.expires_at) > now)
  );
};

export const createFilterRegex = (filters) => {
  if (!filters.length) return null;
  const patterns = filters.flatMap(f => f.keywords.map(kw => {
    let expr = escapeRegExp(kw.keyword);
    return kw.whole_word ? `\\b${expr}\\b` : expr;
  }));
  return new RegExp(patterns.join('|'), 'i');
};
