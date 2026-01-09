import { normalizeTag } from "../../normalizers/tag";

export function createTagsSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    fetchHashtagSuccess(name, tag) {
      setScoped((state) => {
        state[name] = normalizeTag(tag);
      });
    },

    followHashtagRequest(name) {
      setScoped((state) => {
        if (state[name]) {
          state[name].isFollowing = true;
        }
      });
    },

    unfollowHashtagFail(name) {
      setScoped((state) => {
        if (state[name]) {
          state[name].isFollowing = true;
        }
      });
    },

    followHashtagFail(name) {
      setScoped((state) => {
        if (state[name]) {
          state[name].isFollowing = false;
        }
      });
    },

    unfollowHashtagRequest(name) {
      setScoped((state) => {
        if (state[name]) {
          state[name].isFollowing = false;
        }
      });
    },

    async fetchHashtagAction(name) {
      try {
        const res = await fetch(`/api/v1/tags/${encodeURIComponent(name)}`);
        if (!res.ok) throw new Error(`Failed to fetch hashtag (${res.status})`);
        const tag = await res.json();
        this.fetchHashtagSuccess(name, tag);
      } catch (error) {
        console.error('Failed to fetch hashtag:', error);
      }
    },

    async followHashtagAction(name) {
      this.followHashtagRequest(name);
      try {
        const res = await fetch(`/api/v1/tags/${encodeURIComponent(name)}/follow`, {
          method: "POST",
        });
        if (!res.ok) throw new Error(`Failed to follow hashtag (${res.status})`);
      } catch (error) {
        console.error('Failed to follow hashtag:', error);
        this.followHashtagFail(name);
      }
    },

    async unfollowHashtagAction(name) {
      this.unfollowHashtagRequest(name);
      try {
        const res = await fetch(`/api/v1/tags/${encodeURIComponent(name)}/unfollow`, {
          method: "POST",
        });
        if (!res.ok) throw new Error(`Failed to unfollow hashtag (${res.status})`);
      } catch (error) {
        console.error('Failed to unfollow hashtag:', error);
        this.unfollowHashtagFail(name);
      }
    },

  async fetchFollowedHashtags() {
    const root = rootGet();
    this.fetchFollowedHashtagsRequest();
      try {
        const res = await fetch(`/api/v1/followed_tags`);
        if (!res.ok) throw new Error(`Failed to fetch followed hashtags (${res.status})`);
        const data = await res.json();
        const next = res.next();
        root.followedTags.fetchFollowedHashtagsSuccess(data || [], next);
      } catch (error) {
        root.followedTags.fetchFollowedHashtagsFail();
        console.error('Failed to fetch followed hashtags:', error);
      }
    },

    async expandFollowedHashtags() {
      const root = rootGet();
      const url = root.followedTags.next;
      if (url === null || root.followedTags.isLoading) return;

      root.followedTags.expandFollowedHashtagsRequest();
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to expand followed hashtags (${res.status})`);
        const data = await res.json();
        const next = res.next();
        root.followedTags.expandFollowedHashtagsSuccess(data || [], next);
      } catch (error) {
        root.followedTags.expandFollowedHashtagsFail();
        console.error('Failed to expand followed hashtags:', error);
      }   
    },

  };
}

export default createTagsSlice;
