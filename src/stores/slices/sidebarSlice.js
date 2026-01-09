export function createSidebarSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  // get not used
  return {
    sidebarOpen: false,

    openSidebar() {
      set((state) => {
        state.sidebarOpen = true;
      });
    },

    closeSidebar() {
      set((state) => {
        state.sidebarOpen = false;
      });
    },
  };
}
