export function createStatusHoverCardSlice(setScoped, getScoped, rootSet, rootGet) {
  // Helper to access root store actions
  const getActions = () => rootGet();

  return {
    // --- Initial State ---
    ref: null,
    statusId: "",
    hovered: false,

    // --- Actions ---

    openStatusHoverCard(ref, statusId) {
      setScoped((state) => {
        state.ref = ref;
        state.statusId = statusId;
        state.hovered = false; // Reset hover state when moving to a new card
      });
    },

    updateStatusHoverCard() {
      setScoped((state) => {
        state.hovered = true;
      });
    },

    closeStatusHoverCard(force) {
      setScoped((state) => {
        // If the card is currently being hovered and closure isn't forced, do nothing
        if (state.hovered && !force) return;

        state.ref = null;
        state.statusId = "";
        state.hovered = false;
      });
    },

    /**
     * Action wrapper to ensure stable references for UI components
     */
    closeStatusHoverCardAction(force = false) {
      const actions = getActions();
      actions.statusHoverCard.closeStatusHoverCard(force);
    }
  };
}

export default createStatusHoverCardSlice;
