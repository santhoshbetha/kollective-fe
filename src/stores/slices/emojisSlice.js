// Action-only slice for emoji management (custom emojis). No local state — only actions.

import { isLoggedIn } from "../../utils/auth";

export function createEmojisSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    chooseEmoji(emoji) {
        const root = rootGet();
        root.settings.chooseEmoji(emoji);
        root.settings.saveSettings();
    },
  };
}

export default createEmojisSlice;
