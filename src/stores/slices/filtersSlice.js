import { isLoggedIn } from "../../utils/auth.js";
import { normalizeFilter } from "../../normalizers/filter.js";
import { getFeatures } from "../../utils/features.js";

/**
 * Filter Management Slice
 * Handles CRUD operations for content filters.
 */
export function createFiltersSlice(setScoped, getScoped, rootSet, rootGet) {
  // Helper to access flattened actions on the root store
  const getActions = () => rootGet();

  return {
    // --- Internal Logic ---
    
    // Pure helper to normalize a list of filters
    processFilters(filters) {
      return (filters || []).map((filter) => normalizeFilter(filter));
    },

    // --- Asynchronous Actions ---

    async fetchFilters(fromFiltersPage = false) {
      const state = rootGet();
      const actions = getActions();
      
      if (!isLoggedIn(state)) return null;

      try {
        const res = await fetch(`/api/v1/filters`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch filters (${res.status})`);
        
        const data = await res.json();
        
        // Normalize the data before returning
        const filters = actions.processFilters(data);
        
        // If you store filters in state, you would update it here:
        // setScoped((state) => { state.items = filters; });
        
        return filters;
      } catch (err) {
        console.error('filtersSlice.fetchFilters failed', err);
        return null;
      }
    },

    async fetchFilter(id) {
      try {
        const res = await fetch(`/api/v1/filter/${id}`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch filter (${res.status})`);
        
        const data = await res.json();
        return normalizeFilter(data);
      } catch (err) {
        console.error('filtersSlice.fetchFilter failed', err);
        return null;
      }
    },

    async createFilter(title, expires_in, context, hide, keywords) {
      const actions = getActions();
      
      try {
        const res = await fetch(`/api/v1/filters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            context,
            filter_action: hide ? 'hide' : 'warn',
            expires_in,
            keywords_attributes: keywords,
          }),
        });

        if (!res.ok) throw new Error(`Failed to create filter (${res.status})`);
        
        const data = await res.json();
        
        // Trigger global toast if the action exists
        actions.showToast?.("Filter created successfully");
        
        return data;
      } catch (err) {
        console.error('filtersSlice.createFilter failed', err);
        return null;
      }
    },

    async updateFilter(id, title, expires_in, context, hide, keywords) {
      const actions = getActions();

      try {
        const res = await fetch(`/api/v1/filters/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phrase: keywords?.[0]?.keyword,
            context,
            irreversible: hide,
            whole_word: keywords?.[0]?.whole_word,
            expires_in,
          }),
        });

        if (!res.ok) throw new Error(`Failed to update filter (${res.status})`);
        
        const data = await res.json();
        actions.showToast?.("Filter updated successfully");
        
        return data;
      } catch (err) {
        console.error('filtersSlice.updateFilter failed', err);
        return null;
      }
    },

    async deleteFilter(id) {
      const actions = getActions();

      try {
        const res = await fetch(`/api/v1/filters/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error(`Failed to delete filter (${res.status})`);    
        
        actions.showToast?.("Filter deleted");
        
        return true;
      } catch (err) {
        console.error('filtersSlice.deleteFilter failed', err);   
        return null;
      }
    } 
  };
}

export default createFiltersSlice;
