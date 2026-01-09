// Action-only slice for centralized import helpers. No local state — only actions.
// These delegate to the existing `importer` and `accountsMeta` helpers if available.

export function createImportDataSlice(setScoped, getScoped, rootSet, rootGet) {
  return {

    async importFollows(params) {
        try {
            const root = rootGet();
            const res = await fetch('/api/v1/follows_import', {
                method: 'POST',
                body: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // TODO: add toast
        } catch (e) {
            // swallow any errors from best-effort import
        }
    },

    async importBlocks(params) {
        try {
            const root = rootGet();
            const res = await fetch('/api/v1/blocks_import', {
                method: 'POST',
                body: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // TODO: add toast
        } catch (e) {
            // swallow any errors from best-effort import
        }
    },

    async importMutes(params) {
        try {
            const root = rootGet();
            const res = await fetch('/api/v1/mutes_import', {
                method: 'POST',
                body: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // TODO: add toast
        } catch (e) {
            // swallow any errors from best-effort import
        }
    },

  };
}

export default createImportDataSlice;
