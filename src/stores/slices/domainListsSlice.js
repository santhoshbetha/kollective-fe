export const createDomainListsSlice = (
  setScoped /* getScoped, rootSet, rootGet */,
) => ({
  // --- Initial State ---
  blocks: {
    items: [], // Standard Array replaces Set
    next: null,
  },

  fetchDomainBlocksSuccess(domains, next) {
    setScoped((state) => {
      // 1. Normalize input to array and remove duplicates
      const incoming = Array.isArray(domains) ? domains : Array.from(domains || []);
      
      // 2. Direct mutation via Immer
      state.blocks.items = [...new Set(incoming)];
      state.blocks.next = next ?? null;
    });
  },

  expandDomainBlocksSuccess(domains, next) {
    setScoped((state) => {
      const incoming = Array.isArray(domains) ? domains : Array.from(domains || []);
      
      // 3. Merge with existing items and ensure uniqueness
      // This replicates the behavior of state.blocks.items.add()
      const combined = [...state.blocks.items, ...incoming];
      state.blocks.items = [...new Set(combined)];
      
      // Update next only if provided
      if (next !== undefined) {
        state.blocks.next = next;
      }
    });
  },

  unblockDomainSuccess(domain) {
    setScoped((state) => {
      // 4. Standard JS filter replaces Set.delete()
      state.blocks.items = state.blocks.items.filter(item => item !== domain);
    });
  },
});
