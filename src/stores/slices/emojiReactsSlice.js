// Action-only slice for emoji reaction operations. No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

export function createEmojiReactsSlice(setScoped, getScoped, rootSet, rootGet) {
  return {

    async simpleEmojiReact(status, emoji, custom) {
      const root = rootGet();
      if (!isLoggedIn(root)) return null;

      const emojiReacts = Array.isArray(status.reactions) ? status.reactions : [];

      // If user already favourited and trying to react with thumbs-up, unfavourite instead
      if (emoji === '👍' && status.favourited) {
        return root.interactions?.unfavourite?.(status) ?? null;
      }

      const undo = emojiReacts.some((e) => e.me === true && e.name === emoji);
      if (undo) return this.unEmojiReact(status, emoji);

      try {
        // Remove any other emoji reacts from the current user
        const myReacts = emojiReacts.filter((e) => e.me === true).map((e) => e.name);
        for (const name of myReacts) {
          // await each removal to keep server/state in sync
          // ignore individual failures and proceed
          try {
            // this.unEmojiReact returns a promise
            await this.unEmojiReact(status, name);
          } catch {
              // swallow individual errors
            }
        }

        // If the status was favourited, try to unfavourite it first
        if (status.favourited) {
          try {
            await root.interactions?.unfavourite?.(status);
          } catch {
            // ignore
          }
        }

        if (emoji === '👍') {
          return root.interactions?.favourite?.(status) ?? null;
        }

        return this.emojiReact(status, emoji, custom);
      } catch (err) {
        console.error(err);
        return null;
      }
    },

    fetchEmojiReacts(id, emoji) {
      const root = rootGet();
      if (!isLoggedIn(root)) {
        return;
      }

      const url = emoji
      ? `/api/v1/pleroma/statuses/${id}/reactions/${emoji}`
      : `/api/v1/pleroma/statuses/${id}/reactions`;

      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch emoji reacts (${res.status})`);
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            for (const emojiReact of data) {
              if (emojiReact.accounts) {
                root.importer?.importFetchedAccounts?.(emojiReact.accounts);
              }
            }
          }
          this.fetchEmojiReactsSuccess(id, data)
        })
        .catch((err) => {
          this.fetchEmojiReactsFail(id, err);
          console.error('fetchEmojiReacts failed', err);
        });
    },

    async emojiReact(status, emoji, custom) {
      const root = rootGet();
      if (!isLoggedIn(root)) return null;

      try {
        root.statuses?.emojiReactRequest?.(status, emoji, custom);

        const res = await fetch(
          `/api/v1/statuses/${status.id}/reactions/${encodeURIComponent(emoji)}`,
          { method: 'POST' },
        );

        if (!res.ok) throw new Error(`Failed to emoji react (${res.status})`);
        const data = await res.json();

        root.importer?.importFetchedStatus?.(data);
        root.statuses?.emojiReactSuccess?.(status, emoji);
        return data;
      } catch (err) {
        console.error('emojiReactsSlice.emojiReact failed', err);
        root.statuses?.emojiReactFail?.(status, emoji, err);
        return null;
      }
    },

    async unEmojiReact(status, emoji) {
      const root = rootGet();
      if (!isLoggedIn(root)) return null;

      try {
        root.statuses?.unEmojiReactRequest?.(status, emoji);

        const res = await fetch(
          `/api/v1/statuses/${status.id}/reactions/${encodeURIComponent(emoji)}`,
          { method: 'DELETE' },
        );

        if (!res.ok) throw new Error(`Failed to unemoji react (${res.status})`);
        const data = await res.json();

        root.importer?.importFetchedStatus?.(data);
        root.statuses?.unEmojiReactSuccess?.(status, emoji);
        return data;
      } catch (err) {
        console.error('emojiReactsSlice.unEmojiReact failed', err);
        root.statuses?.unEmojiReactFail?.(status, emoji, err);
        return null;
      }
    },  


  };
}

export default createEmojiReactsSlice;
