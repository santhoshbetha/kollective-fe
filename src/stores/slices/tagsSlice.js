import { normalizeTag } from "../../normalizers/tag";

export function createTagsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  // Internal helper for toggling following state locally
  const setFollowing = (name, value) => {
    setScoped((state) => {
      if (state[name]) state[name].isFollowing = value;
    });
  };

  return {
    fetchHashtagSuccess(name, tag) {
      setScoped((state) => {
        state[name] = normalizeTag(tag);
      });
    },


    followHashtagRequest: (name) => setFollowing(name, true),
    followHashtagFail: (name) => setFollowing(name, false),
    unfollowHashtagRequest: (name) => setFollowing(name, false),
    unfollowHashtagFail: (name) => setFollowing(name, true),

    async fetchHashtagAction(name) {
      const actions = getActions();
      try {
        const res = await fetch(`/api/v1/tags/${encodeURIComponent(name)}`);
        if (!res.ok) throw new Error(`Failed to fetch hashtag (${res.status})`);
        
        const tag = await res.json();
        actions.fetchHashtagSuccess(name, tag);
      } catch (error) {
        console.error('TagsSlice.fetchHashtagAction failed', error);
      }
    },

    async followHashtagAction(name) {
      const actions = getActions();
      actions.followHashtagRequest(name);
      
      try {
        const res = await fetch(`/api/v1/tags/${encodeURIComponent(name)}/follow`, {
          method: "POST",
        });
        if (!res.ok) throw new Error(`Follow failed (${res.status})`);
      } catch (error) {
        actions.followHashtagFail(name);
        console.error('TagsSlice.followHashtagAction failed', error);
      }
    },

    async unfollowHashtagAction(name) {
      const actions = getActions();
      actions.unfollowHashtagRequest(name);
      
      try {
        const res = await fetch(`/api/v1/tags/${encodeURIComponent(name)}/unfollow`, {
          method: "POST",
        });
        if (!res.ok) throw new Error(`Unfollow failed (${res.status})`);
      } catch (error) {
        actions.unfollowHashtagFail(name);
        console.error('TagsSlice.unfollowHashtagAction failed', error);
      }
    },
    
    async fetchFollowedHashtags() {
      const actions = getActions();
      const followedTags = actions.followedTags;

      followedTags?.fetchFollowedHashtagsRequest?.();
      
      try {
        const res = await fetch(`/api/v1/followed_tags`);
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        
        const data = await res.json();
        const next = typeof res.next === 'function' ? res.next() : null;

        followedTags?.fetchFollowedHashtagsSuccess?.(data || [], next);
      } catch (error) {
        followedTags?.fetchFollowedHashtagsFail?.();
        console.error('TagsSlice.fetchFollowedHashtags failed', error);
      }
    },

    async expandFollowedHashtags() {
      const actions = getActions();
      const followedTags = actions.followedTags;
      const url = followedTags?.next;

      if (!url || followedTags?.isLoading) return;

      followedTags.expandFollowedHashtagsRequest?.();
      
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Expand failed (${res.status})`);
        
        const data = await res.json();
        const next = typeof res.next === 'function' ? res.next() : null;

        followedTags.expandFollowedHashtagsSuccess?.(data || [], next);
      } catch (error) {
        followedTags.expandFollowedHashtagsFail?.();
        console.error('TagsSlice.expandFollowedHashtags failed', error);
      }   
    },

  };
}

export default createTagsSlice;
