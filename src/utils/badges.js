
/** Convert a plain tag into a badge. */
const tagToBadge = (tag) => `badge:${tag}`;

/** Convert a badge into a plain tag. */
const badgeToTag = (badge) => badge.replace(/^badge:/, '');

/** Returns the differences between two sets of tags.
 * Uses plain JS Sets and returns frozen arrays/objects so the result is
 * effectively immutable without relying on Immutable.js.
 */
const getTagDiff = (oldTags, newTags) => {
  const oArr = Array.isArray(oldTags) ? oldTags : [];
  const nArr = Array.isArray(newTags) ? newTags : [];

  const oSet = new Set(oArr);
  const nSet = new Set(nArr);

  const added = [];
  const removed = [];

  for (const v of nSet) {
    if (!oSet.has(v)) added.push(v);
  }

  for (const v of oSet) {
    if (!nSet.has(v)) removed.push(v);
  }

  return Object.freeze({
    added: Object.freeze(added),
    removed: Object.freeze(removed),
  });
};

/** Returns only tags which are badges. */
const filterBadges = (tags) => {
  return tags.filter(tag => tag.startsWith('badge:'));
};

/** Get badges from an account. */
const getBadges = (account) => {
  const tags = account?.pleroma?.tags ?? [];
  return filterBadges(tags);
};

export {
  tagToBadge,
  badgeToTag,
  filterBadges,
  getTagDiff,
  getBadges,
};