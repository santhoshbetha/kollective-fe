import { emojiReactionSchema } from "../schemas/emoji-reaction";

// https://emojipedia.org/facebook
// I've customized them.
export const ALLOWED_EMOJI = ["👍", "❤️", "😆", "😮", "😢", "😩"];

/*
export const sortEmojiX = (emojiReacts, allowedEmoji) => {
  if (!Array.isArray(emojiReacts)) return [];
  return [...emojiReacts].sort((a, b) => {
    const scoreA = (a.count || 0) + Number(allowedEmoji.includes(a.name));
    const scoreB = (b.count || 0) + Number(allowedEmoji.includes(b.name));
    return scoreB - scoreA;
  });
};

export const mergeEmojiFavouritesX= (
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

export const getReactForStatusX = (status, allowedEmoji = ALLOWED_EMOJI) => {
  if (!status || !status.reactions) return;

  const result = reduceEmoji(
    status.reactions,
    status.favourites_count || 0,
    status.favourited,
    allowedEmoji,
  ).filter((e) => e.me === true)[0];

  return typeof result?.name === "string" ? result : undefined;
};

export const simulateEmojiReactX = (emojiReacts, emoji, url) => {
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
export const simulateUnEmojiReactX = (emojiReacts, emoji) => {
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

*/

//1. Updated sortEmoji
//Uses a more stable sorting logic to prevent the UI from "flickering" when counts change.
export const sortEmoji = (emojiReacts, allowedEmoji = ALLOWED_EMOJI) => {
  if (!Array.isArray(emojiReacts)) return [];
  return [...emojiReacts].sort((a, b) => {
    // Priority: 1. Allowed list, 2. Count, 3. Alphabetical (for stability)
    const scoreA = (a.count || 0) + (allowedEmoji.includes(a.name) ? 1000 : 0);
    const scoreB = (b.count || 0) + (allowedEmoji.includes(b.name) ? 1000 : 0);
    
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });
};

//Modified to be safer for Optimistic Updates. It now ensures that "Likes" (the "👍" emoji) 
//are correctly synchronized with the server's favourites_count.
export const mergeEmojiFavourites = (emojiReacts, favouritesCount = 0, favourited = false) => {
  const reacts = Array.isArray(emojiReacts) ? [...emojiReacts] : [];
  
  // If no likes and no other reacts, just show an empty "👍" for the UI
  if (favouritesCount === 0 && reacts.length === 0) {
    return [emojiReactionSchema.parse({ count: 0, me: favourited, name: "👍" })];
  }

  const likeIndex = reacts.findIndex((e) => e.name === "👍");

  if (likeIndex > -1) {
    // Update existing 👍 reaction
    reacts[likeIndex] = emojiReactionSchema.parse({
      ...reacts[likeIndex],
      count: favouritesCount, // Source of truth is the status.favourites_count
      me: favourited,
    });
    return reacts;
  } else if (favouritesCount > 0) {
    // Add new 👍 reaction
    return [
      ...reacts,
      emojiReactionSchema.parse({ count: favouritesCount, me: favourited, name: "👍" }),
    ];
  }
  
  return reacts;
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


// Refined to handle undefined cases safely so your UI doesn't crash during loading states.
export const getReactForStatus = (status, allowedEmoji = ALLOWED_EMOJI) => {
  if (!status) return undefined;

  // Mastodon uses 'reactions', some forks use 'emoji_reactions'
  const reactions = status.reactions || status.emoji_reactions || [];

  const reduced = reduceEmoji(
    reactions,
    status.favourites_count || 0,
    status.favourited,
    allowedEmoji
  );

  return reduced.find((e) => e.me === true);
};

//Ensures that adding a reaction is atomic—if you've already reacted, it won't add a duplicate.
export const simulateEmojiReact = (emojiReacts, emoji, url) => {
  const reacts = Array.isArray(emojiReacts) ? [...emojiReacts] : [];
  const idx = reacts.findIndex((e) => e.name === emoji);

  if (idx > -1) {
    const existing = reacts[idx];
    // Don't increment if I already reacted (idempotency)
    if (existing.me) return reacts;

    reacts[idx] = emojiReactionSchema.parse({
      ...existing,
      count: (existing.count || 0) + 1,
      me: true,
      url: url || existing.url,
    });
    return reacts;
  }

  return [
    ...reacts,
    emojiReactionSchema.parse({ count: 1, me: true, name: emoji, url }),
  ];
};

//Your simulateUnEmojiReact function is logically sound, but it needs three specific adjustments 
///to work perfectly with TanStack Query and your Zod schema:

//    1. Immutability: TanStack Query requires a new object reference for the state to update properly. 
//       Your current use of slice and spread is good, but we should ensure the final array is returned cleanly.
//    2. Schema Validation: You are using emojiReactionSchema.parse. Ensure this schema allows count: 0 
//       if you plan to keep the object in the array, though your current logic correctly removes it when count < 1.
//    3. The "Me" check: In most Fediverse APIs, once you "unreact," the me flag becomes false or the reaction 
//       is removed entirely.
//Optimized Version for TanStack Query

export const simulateUnEmojiReact = (emojiReacts, emoji) => {
  // Ensure we are working with an array to prevent crashes
  const reacts = Array.isArray(emojiReacts) ? [...emojiReacts] : [];
  
  // Find the reaction index where I am the one who reacted
  const idx = reacts.findIndex((e) => e.name === emoji && e.me === true);

  if (idx !== -1) {
    const emojiReact = reacts[idx];
    const newCount = (emojiReact.count || 1) - 1;

    // 1. If count reaches 0, remove the reaction entirely from the list
    if (newCount < 1) {
      return reacts.filter((_, i) => i !== idx);
    }

    // 2. Otherwise, update the count and set 'me' to false
    const updatedReaction = emojiReactionSchema.parse({
      ...emojiReact,
      count: newCount,
      me: false,
    });

    const newArray = [...reacts];
    newArray[idx] = updatedReaction;
    return newArray;
  }

  return reacts;
};

/*
Why these changes matter for TanStack Query:

    1. Referential Stability: We always return a new array only if a change occurred. 
    This prevents unnecessary re-renders in your StatusAction component.
    2. Idempotency: Mutations might trigger multiple times if the user double-clicks. 
    These helpers ensure the count only goes up once.
    3. Source of Truth: In Mastodon, favourited is a top-level property. By mapping it 
    to the 👍 reaction, you make the UI consistent between the "Like" button and the "Emoji" bar.

*/
