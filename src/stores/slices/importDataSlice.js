// Action-only slice for centralized import helpers. No local state — only actions.
// These delegate to the existing `importer` and `accountsMeta` helpers if available.

/**
 * Action-only slice for data import operations.
 * Handles CSV/JSON imports for follows, blocks, and mutes.
 */
export function createImportDataSlice(setScoped, getScoped, rootSet, rootGet) {
  // Helper to access root actions (like a global toast system)
  const getActions = () => rootGet();

  return {
    async importFollows(params) {
      const actions = getActions();
      try {
        const res = await fetch('/api/v1/follows_import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        // Notify user of success via a global action
        actions.showToast?.("Follows import started successfully");
        return await res.json();
      } catch (e) {
        console.error('importDataSlice.importFollows failed', e);
        actions.showToast?.("Failed to import follows", "error");
      }
    },

    async importBlocks(params) {
      const actions = getActions();
      try {
        const res = await fetch('/api/v1/blocks_import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        actions.showToast?.("Blocks import started successfully");
        return await res.json();
      } catch (e) {
        console.error('importDataSlice.importBlocks failed', e);
        actions.showToast?.("Failed to import blocks", "error");
      }
    },

    async importMutes(params) {
      const actions = getActions();
      try {
        const res = await fetch('/api/v1/mutes_import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        actions.showToast?.("Mutes import started successfully");
        return await res.json();
      } catch (e) {
        console.error('importDataSlice.importMutes failed', e);
        actions.showToast?.("Failed to import mutes", "error");
      }
    },
  };
}

export default createImportDataSlice;
