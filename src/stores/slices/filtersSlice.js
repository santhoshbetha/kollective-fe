import { isLoggedIn } from "../../utils/auth.js";
import { normalizeFilter } from "../../normalizers/filter.js";
import { getFeatures } from "../../utils/features.js";

export function createFiltersSlice(setScoped, getScoped, rootSet, rootGet) {
  return {

    fetchFiltersSuccess(filters) {
      return filters.map((filter) => normalizeFilter(filter));
    },

    async fetchFilters(fromFiltersPage = false) {
      const root = rootGet();
      if (!isLoggedIn(root)) return null;
      const features = getFeatures();

      try {
        const res = await fetch(`/api/v1/filters`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch filters (${res.status})`);
        const data = await res.json();
        const filters = this.fetchFiltersSuccess(data || []);
        return filters;
      } catch(err) {
        console.error('filtersSlice.fetchFilters failed', err);
        return null;
      }
    },

    async fetchFilter (id) {
      try {
        const res = await fetch(`/api/v1/filter/${id}`, { method: 'GET' });
        if (!res.ok) throw new Error(`Failed to fetch filters (${res.status})`);
        const data = await res.json();
        return data;
      } catch(err) {
        console.error('filtersSlice.fetchFilter failed', err);
        return null;
      }
    },

    async createFilter (title, expires_in, context, hide, keywords) {
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
        //TODO add toast
        return data;
      } catch(err) {
        console.error('filtersSlice.createFilter failed', err);
        return null;
      }
    },

    async updateFilter (id, title, expires_in, context, hide, keywords) {
      try {
        const res = await fetch(`/api/v1/filters/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phrase: keywords[0].keyword,
            context,
            irreversible: hide,
            whole_word: keywords[0].whole_word,
            expires_in,
          }),
        });
        if (!res.ok) throw new Error(`Failed to update filter (${res.status})`);
        const data = await res.json();
        //TODO add toast
        return data;
      } catch(err) {
        console.error('filtersSlice.updateFilter failed', err);
        return null;
      }
    },

    async deleteFilter (id) {
      try {
        const res = await fetch(`/api/v1/filters/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error(`Failed to delete filter (${res.status})`);    
        //TODO add toast
        return true;
      } catch(err) {
        console.error('filtersSlice.deleteFilter failed', err);   
        return null;
      }
    } 
  }
}

export default createFiltersSlice;
