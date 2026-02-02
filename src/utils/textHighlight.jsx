// src/utils/textHighlight.jsx
//Search Highlighting
// /Create src/utils/textHighlight.jsx. This function splits the name into parts, allowing you to wrap the matching segment in a styled <mark> or <span>.
export const highlightText = (text, query) => {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return parts.map((part, i) => 
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="search-highlight">{part}</mark>
    ) : (
      part
    )
  );
};
