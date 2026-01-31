export function createSidebarSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();
  // get not used
  return {
    // --- Initial State ---
    sidebarOpen: false,

    // --- Actions ---

    openSidebar() {
      setScoped((state) => {
        state.sidebarOpen = true;
      });
    },

    closeSidebar() {
      setScoped((state) => {
        state.sidebarOpen = false;
      });
    },

    /**
     * Example of using the actions pattern for a toggle
     */
    toggleSidebar() {
      const actions = getActions();
      const isCurrentlyOpen = getScoped().sidebarOpen;
      
      if (isCurrentlyOpen) {
        actions.closeSidebar();
      } else {
        actions.openSidebar();
      }
    }

  };
}
