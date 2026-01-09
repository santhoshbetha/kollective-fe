export function createStatusHoverCardSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  // get not needed
  return {
    ref: null,
    statusId: "",
    hovered: false,

    openStatusHoverCard(ref, statusId) {
      set((state) => {
        state.ref = ref;
        state.statusId = statusId;
      });
    },

    updateStatusHoverCard() {
      set((state) => {
        state.hovered = true;
      });
    },

    closeStatusHoverCard(force) {
      set((state) => {
        if (state.hovered && !force) {
          return state;
        } else {
          return {
            ref: null,
            statusId: "",
            hovered: false,
          };
        }
      });
    },
  };
}

export default createStatusHoverCardSlice;
