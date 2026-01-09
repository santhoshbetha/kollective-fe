export const createDomainListsSlice = (
  setScoped /* getScoped, rootSet, rootGet */,
) => ({
  blocks: {
    items: new Set(),
    next: null,
  },

  fetchDomainBlocksSuccess(domains, next) {
    setScoped((state) => {
      const src = Array.isArray(domains) ? domains : Array.from(domains || []);
      return {
        ...state,
        blocks: {
          items: new Set(src),
          next: next ?? null,
        },
      };
    });
  },

  expandDomainBlocksSuccess(domains, next) {
    setScoped((state) => {
      const existing = new Set(
        (state && state.blocks && state.blocks.items) || [],
      );
      const newItems = Array.isArray(domains)
        ? domains
        : Array.from(domains || []);
      for (const d of newItems) existing.add(d);
      return {
        ...state,
        blocks: {
          items: existing,
          next: next ?? ((state && state.blocks && state.blocks.next) || null),
        },
      };
    });
  },

  unblockDomainSuccess(domain) {
    setScoped((state) => {
      const existing = new Set(
        (state && state.blocks && state.blocks.items) || [],
      );
      existing.delete(domain);
      return {
        ...state,
        blocks: {
          items: existing,
          next: (state && state.blocks && state.blocks.next) || null,
        },
      };
    });
  },
});
