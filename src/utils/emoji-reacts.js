import { emojiReactionSchema } from "../schemas/emoji-reaction";

// https://emojipedia.org/facebook
// I've customized them.
export const ALLOWED_EMOJI = ["👍", "❤️", "😆", "😮", "😢", "😩"];

export const sortEmoji = (emojiReacts, allowedEmoji) => {
  if (!Array.isArray(emojiReacts)) return [];
  return [...emojiReacts].sort((a, b) => {
    const scoreA = (a.count || 0) + Number(allowedEmoji.includes(a.name));
    const scoreB = (b.count || 0) + Number(allowedEmoji.includes(b.name));
    return scoreB - scoreA;
  });
};

export const mergeEmojiFavourites = (
  emojiReacts,
  favouritesCount,
  favourited,
) => {
  const reacts = Array.isArray(emojiReacts) ? emojiReacts : [];
  if (!favouritesCount && reacts.length === 0) {
    return [
      emojiReactionSchema.parse({
        count: favouritesCount,
        me: favourited,
        name: "👍",
      }),
    ];
  }
  if (!favouritesCount) return reacts;

  const likeIndex = reacts.findIndex((emojiReact) => emojiReact.name === "👍");
  if (likeIndex > -1) {
    const existing = reacts[likeIndex];
    const likeCount = Number(existing.count || 0);
    const newMe = favourited || Boolean(existing.me);
    return [
      ...reacts.slice(0, likeIndex),
      { ...existing, count: likeCount + favouritesCount, me: newMe },
      ...reacts.slice(likeIndex + 1),
    ];
  } else {
    return [
      ...reacts,
      emojiReactionSchema.parse({
        count: favouritesCount,
        me: favourited,
        name: "👍",
      }),
    ];
  }
};

export const reduceEmoji = (
  emojiReacts,
  favouritesCount,
  favourited,
  allowedEmoji = ALLOWED_EMOJI,
) =>
  sortEmoji(
    mergeEmojiFavourites(emojiReacts, favouritesCount, favourited),
    allowedEmoji,
  );

export const getReactForStatus = (status, allowedEmoji = ALLOWED_EMOJI) => {
  if (!status || !status.reactions) return;

  const result = reduceEmoji(
    status.reactions,
    status.favourites_count || 0,
    status.favourited,
    allowedEmoji,
  ).filter((e) => e.me === true)[0];

  return typeof result?.name === "string" ? result : undefined;
};

export const simulateEmojiReact = (emojiReacts, emoji, url) => {
  const reacts = Array.isArray(emojiReacts) ? emojiReacts : [];
  const idx = reacts.findIndex((e) => e.name === emoji);
  const emojiReact = reacts[idx];

  if (idx > -1 && emojiReact) {
    return [
      ...reacts.slice(0, idx),
      emojiReactionSchema.parse({
        ...emojiReact,
        count: (emojiReact.count || 0) + 1,
        me: true,
        url,
      }),
      ...reacts.slice(idx + 1),
    ];
  } else {
    return [
      ...reacts,
      emojiReactionSchema.parse({
        count: 1,
        me: true,
        name: emoji,
        url,
      }),
    ];
  }
};

export const simulateUnEmojiReact = (emojiReacts, emoji) => {
  const reacts = Array.isArray(emojiReacts) ? emojiReacts : [];
  const idx = reacts.findIndex((e) => e.name === emoji && e.me === true);
  const emojiReact = reacts[idx];

  if (emojiReact) {
    const newCount = (emojiReact.count || 1) - 1;
    if (newCount < 1) {
      return [...reacts.slice(0, idx), ...reacts.slice(idx + 1)];
    }
    return [
      ...reacts.slice(0, idx),
      emojiReactionSchema.parse({
        ...emojiReact,
        count: newCount,
        me: false,
      }),
      ...reacts.slice(idx + 1),
    ];
  } else {
    return reacts;
  }
};
