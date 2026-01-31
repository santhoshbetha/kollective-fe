import { normalizeTag } from "../../normalizers/tag";

export function createFollowedTagsSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    // --- Initial State ---
    items: [],
    isLoading: false,
    next: null,

    // --- Actions ---
    fetchFollowedHashtagsRequest() {
      setScoped((state) => {
        state.isLoading = true;
      });
    },

    fetchFollowedHashtagsSuccess(next, followedTags) {
      setScoped((state) => {
        // 1. Normalize and filter in one pass
        const tags = (Array.isArray(followedTags) ? followedTags : [])
          .map(normalizeTag)
          .filter(Boolean);

        state.items = tags;
        state.isLoading = false;
        state.next = next ?? null;
      });
    },

    fetchFollowedHashtagsFail() {
      setScoped((state) => {
        state.isLoading = false;
      });
    },

    expandFollowedHashtagsRequest() {
      setScoped((state) => {
        state.isLoading = true;
      });
    },

    expandFollowedHashtagsSuccess(next, followedTags) {
      setScoped((state) => {
        const incoming = (Array.isArray(followedTags) ? followedTags : [])
          .map(normalizeTag)
          .filter(Boolean);

        // 2. Deduplicate using standard Array.some()
        // Immer allows us to push directly to the draft
        incoming.forEach((newTag) => {
          const exists = state.items.some((t) => t.name === newTag.name);
          if (!exists) {
            state.items.push(newTag);
          }
        });

        state.isLoading = false;
        state.next = next ?? null;
      });
    },

    expandFollowedHashtagsFail() {
      setScoped((state) => {
        state.isLoading = false;
      });
    },
  };
}

export default createFollowedTagsSlice;
