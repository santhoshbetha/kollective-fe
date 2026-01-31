export function createRemoteTimelineSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();
  // get not used
  return {
    // --- Initial State ---
    remoteTimeline: [],
    helpers: {},

    setHelpers(helpers) {
      setScoped((state) => {
        state.helpers = helpers || {};
      });
    },

    importRemote(items = []) {
      const actions = getActions();
      
      // Coordinate with central importer if available
      if (actions.importFetchedStatuses) {
        actions.importFetchedStatuses(items);
        return;
      }

      // Fallback: direct mutation of local state
      setScoped((state) => {
        state.remoteTimeline.push(...items);
      });
    },

    clearRemote() {
      setScoped((state) => {
        state.remoteTimeline = [];
      });
    },

    getPinnedHosts() {
      const actions = getActions();
      // Using optional chaining for clean path traversal
      return actions.getSettings?.()?.remote_timeline?.pinnedHosts || [];
    },

    pinHost(host) {
      const actions = getActions();
      // Use local helper via actions reference
      const pinnedHosts = actions.getPinnedHosts();

      if (pinnedHosts.includes(host)) return null;

      const newPinned = [host, ...pinnedHosts];

      // Call external slice action
      return actions.changeSetting?.(["remote_timeline", "pinnedHosts"], newPinned);
    },

    unpinHost(host) {
      const actions = getActions();
      const pinnedHosts = actions.getPinnedHosts();

      const filtered = pinnedHosts.filter((h) => h !== host);

      return actions.changeSetting?.(["remote_timeline", "pinnedHosts"], filtered);
    },

  };
}

export default createRemoteTimelineSlice;
