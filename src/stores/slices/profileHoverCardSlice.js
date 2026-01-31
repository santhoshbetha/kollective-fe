import { update } from "lodash";

export function createProfileHoverCardSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  // get not used
  return {
    // Initial State
    ref: null,
    accountId: "",
    hovered: false,

    profileHoverCardOpen(ref, accountId) {
      setScoped((state) => {
        state.ref = ref;
        state.accountId = accountId;
        state.hovered = false; // Reset hover state when opening a new card
      });
    },

    profileHoverCardUpdate() {
      setScoped((state) => {
        state.hovered = true;
      });
    },

    profileHoverCardClose(force) {
      setScoped((state) => {
        // If not forced and the mouse is currently hovering the card, keep it open
        if (!force && state.hovered) return;

        state.ref = null;
        state.accountId = "";
        state.hovered = false;
      });
    },

    openProfileHoverCardAction(ref, accountId) {
      getScoped().profileHoverCardOpen(ref, accountId);
    },

    updateProfileHoverCardAction() {
      getScoped().profileHoverCardUpdate();
    },

    closeProfileHoverCardAction(force = false) {
      getScoped().profileHoverCardClose(force);
    },
  };
}

export default createProfileHoverCardSlice;
