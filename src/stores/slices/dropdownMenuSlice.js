export const createDropdownMenuSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {
  const set = setScoped;
  return ({
  isOpen: false,

  openDropdownMenu() {
    set((state) => {
      state.isOpen = true;
    });
  },

  closeDropdownMenu() {
    set((state) => {
      state.isOpen = false;
    });
  },
  });
};
