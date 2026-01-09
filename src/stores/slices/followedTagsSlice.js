import { normalizeTag } from "../../normalizers/tag";

export function createFollowedTagsSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    items: [],
    isLoading: false,
    next: null,

    fetchFollowedHashtagsRequest() {
      setScoped((state) => {
        state.isLoading = true;
      });
    },

    fetchFollowedHashtagsSuccess(next, followed_tags) {
      setScoped((state) => {
        next = next ?? null;
        followed_tags = Array.isArray(followed_tags) ? followed_tags : [];

        state.items = (followed_tags || [])
          .map((tag) => normalizeTag(tag))
          .filter(Boolean);
        state.isLoading = false;
        state.next = next;
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

    expandFollowedHashtagsSuccess(next, followed_tags) {
      setScoped((state) => {
        next = next ?? null;
        followed_tags = Array.isArray(followed_tags) ? followed_tags : [];

        const existingTags = state.items || [];
        const newTags = (followed_tags || [])
          .map((tag) => normalizeTag(tag))
          .filter(Boolean)
          .filter(
            (newTag) =>
              !existingTags.some(
                (existingTag) => existingTag.name === newTag.name,
              ),
          );

        state.items = existingTags.concat(newTags);
        state.isLoading = false;
        state.next = next;
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
