import { isLoggedIn } from "../../utils/auth";

export function createEmojiReactsSlice(setScoped, getScoped, rootSet, rootGet) {
  // Helper to access root actions (all spread slices)
  const getActions = () => rootGet();

  return {
    async simpleEmojiReact(status, emoji, custom) {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state)) return null;

      const emojiReacts = Array.isArray(status.reactions) ? status.reactions : [];

      // 1. Special case: 👍 + Favourite toggle
      if (emoji === '👍' && status.favourited) {
        return actions.unfavourite?.(status) ?? null;
      }

      // 2. Undo logic if already reacted with this specific emoji
      const undo = emojiReacts.some((e) => e.me === true && e.name === emoji);
      if (undo) return actions.unEmojiReact(status, emoji);

      try {
        // 3. Clear existing reacts from 'me' (Kollective allows only one emoji react at a time)
        const myReacts = emojiReacts.filter((e) => e.me === true).map((e) => e.name);
        
        for (const name of myReacts) {
          try {
            await actions.unEmojiReact(status, name);
          } catch (e) {
            // Swallow individual removal errors
          }
        }

        // 4. Handle transition from Favourite to Emoji React
        if (status.favourited) {
          try {
            await actions.unfavourite?.(status);
          } catch (e) {}
        }

        // 5. Finalize React: Thumbs up maps back to native Favourite
        if (emoji === '👍') {
          return actions.favourite?.(status) ?? null;
        }

        return actions.emojiReact(status, emoji, custom);
      } catch (err) {
        console.error('simpleEmojiReact failed', err);
        return null;
      }
    },

    async fetchEmojiReacts(id, emoji) {
      const actions = getActions();
      const state = rootGet();
      if (!isLoggedIn(state)) return;

      const url = emoji
        ? `/api/v1/kollective/statuses/${id}/reactions/${encodeURIComponent(emoji)}`
        : `/api/v1/kollective/statuses/${id}/reactions`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();

        if (Array.isArray(data)) {
          // Import accounts from nested reactions
          const allAccounts = data.flatMap(react => react.accounts || []);
          actions.importFetchedAccounts?.(allAccounts);
        }

        actions.fetchEmojiReactsSuccess?.(id, data);
      } catch (err) {
        actions.fetchEmojiReactsFail?.(id, err);
        console.error('fetchEmojiReacts failed', err);
      }
    },

    async emojiReact(status, emoji, custom) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      try {
        // Optimistic UI request
        actions.emojiReactRequest?.(status, emoji, custom);

        const res = await fetch(
          `/api/v1/statuses/${status.id}/reactions/${encodeURIComponent(emoji)}`,
          { method: 'POST' },
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Sync store with returned status object
        actions.importFetchedStatus?.(data);
        actions.emojiReactSuccess?.(status, emoji);
        return data;
      } catch (err) {
        console.error('emojiReact failed', err);
        actions.emojiReactFail?.(status, emoji, err);
        return null;
      }
    },

    async unEmojiReact(status, emoji) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return null;

      try {
        // Optimistic UI request
        actions.unEmojiReactRequest?.(status, emoji);

        const res = await fetch(
          `/api/v1/statuses/${status.id}/reactions/${encodeURIComponent(emoji)}`,
          { method: 'DELETE' },
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        actions.importFetchedStatus?.(data);
        actions.unEmojiReactSuccess?.(status, emoji);
        return data;
      } catch (err) {
        console.error('unEmojiReact failed', err);
        actions.unEmojiReactFail?.(status, emoji, err);
        return null;
      }
    },
  };
}

export default createEmojiReactsSlice;
