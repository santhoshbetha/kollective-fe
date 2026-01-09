import { getIn } from "../../utils/immutableSafe";

export function createRemoteTimelineSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  // get not used
  return {
    remoteTimeline: [],
    helpers: {},
    setHelpers(helpers) {
      set((s) => {
        s.helpers = helpers || {};
      });
    },

    importRemote(items = []) {
      try {
        const importer = rootGet().importer;
        if (importer && typeof importer.importFetchedStatuses === "function") {
          importer.importFetchedStatuses(items);
          return;
        }
      } catch (err) {
        void err;
      }
      set((s) => {
        s.remoteTimeline = (s.remoteTimeline || []).concat(items || []);
      });
    },

    clearRemote() {
      set((s) => {
        s.remoteTimeline = [];
      });
    },

    getPinnedHosts() {
      const root = rootGet();
      const settings = root.getSettings?.();
      return getIn(settings, ["remote_timeline", "pinnedHosts"]) || [];
    },

    pinHost(host) {
      const root = rootGet();
      const pinnedHosts = this.getPinnedHosts() || [];

      // Normalize to plain array
      const arr = Array.isArray(pinnedHosts)
        ? pinnedHosts.slice()
        : Array.from(pinnedHosts || []);

      // Prepend if not present
      if (!arr.includes(host)) arr.unshift(host);

      if (root.settings && typeof root.settings.changeSetting === "function") {
        return root.settings.changeSetting(["remote_timeline", "pinnedHosts"], arr);
      }
      return null;
    },

    unpinHost(host) {
      const root = rootGet();
      const pinnedHosts = this.getPinnedHosts() || [];

      const arr = Array.isArray(pinnedHosts)
        ? pinnedHosts.slice()
        : Array.from(pinnedHosts || []);

      const filtered = arr.filter((h) => h !== host);

      if (root.settings && typeof root.settings.changeSetting === "function") {
        return root.settings.changeSetting(["remote_timeline", "pinnedHosts"], filtered);
      }
      return null;
    },

  };
}

export default createRemoteTimelineSlice;
