export const createPatronSlice = (setScoped, get, rootSet, rootGet) => ({
  patrons: [],
  setPatrons(list) {
    setScoped((s) => {
      s.patrons = list;
    });
  },
});
