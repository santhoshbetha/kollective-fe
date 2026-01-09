// Action-only slice for data export operations. No local state — only actions.

export function createExportDataSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
     //TOD later implement export functions
   exportFollows() {
        // TODO: implement export of follows
        return Promise.resolve();
   },

   exportBlocks() {
        // TODO: implement export of blocked accounts
        return Promise.resolve();
   },

   exportMutes() {
        // TODO: implement export of mutes
        return Promise.resolve();
   }


  };
}

export default createExportDataSlice;
