// Action-only slice for emoji management (custom emojis). No local state — only actions.

export function createEmojisSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();
  return {
    chooseEmoji(emoji) {
        const actions = getActions();
        actions.settings.chooseEmoji(emoji);
        actions.settings.saveSettings();
    },
  };
}

export default createEmojisSlice;
