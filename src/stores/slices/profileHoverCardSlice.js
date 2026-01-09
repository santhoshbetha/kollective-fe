import { update } from "lodash";

export function createProfileHoverCardSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  // get not used
  return {
    ref: null,
    accountId: "",
    hovered: false,

    profileHoverCardOpen(ref, accountId) {
      set((state) => {
        state.ref = ref;
        state.accountId = accountId;
      });
    },

    profileHovercardUpdate() {
      set((state) => {
        state.hovered = true;
      });
    },

    profileHoverCardClose(force) {
      set((state) => {
        if (!force && state.hovered) {
          return state;
        } else {
          return {
            ref: null,
            accountId: "",
            hovered: false,
          };
        }
      });
    },

    openProfileHoverCardAction(ref, accountId) {
      this.profileHoverCardOpen(ref, accountId);
    },

    updateProfileHoverCardAction() {
      this.profileHovercardUpdate();
    },

    closeProfileHoverCardAction(force = false) {
      this.profileHoverCardClose(force);
    },
  };
}

export default createProfileHoverCardSlice;
