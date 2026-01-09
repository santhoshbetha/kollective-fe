/** Trim the username and strip the leading @. */
const normalizeUsername = (username) => {
  if (!username || typeof username !== 'string') return '';
  const trimmed = username.trim();
  if (trimmed[0] === '@') {
    return trimmed.slice(1);
  } else {
    return trimmed;
  }
};

function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w]/g, '-') // replace non-word characters with a hyphen
    .replace(/-+/g, '-'); // replace multiple hyphens with a single hyphen
}

export {
  normalizeUsername,
  slugify,
};