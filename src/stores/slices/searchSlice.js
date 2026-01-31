import { normalizeTag } from "../../normalizers/tag";

// Helper for unique ID sets
const toIds = (items = []) => new Set(items.map((item) => item.id));

const initialState = {
  value: "",
  submitted: false,
  submittedValue: "",
  hidden: false,
  results: {
    accounts: new Set(),
    statuses: new Set(),
    groups: new Set(),
    hashtags: new Set(),
    accountsHasMore: false,
    statusesHasMore: false,
    groupsHasMore: false,
    hashtagsHasMore: false,
    accountsLoaded: false,
    statusesLoaded: false,
    groupsLoaded: false,
    hashtagsLoaded: false,
  },
  filter: "statuses",
  accountId: null,
  next: null,
};

export const createSearchSlice = (setScoped, get, rootSet, rootGet) => {
  const getActions = () => rootGet();

  return {
    ...initialState,

    changeSearch(value) {
      setScoped((state) => { state.value = value; });
    },

    clearSearchResults() {
      setScoped((state) => {
        state.value = "";
        state.results = initialState.results;
        state.submitted = false;
        state.submittedValue = "";
      });
    },

    showSearch() {
      setScoped((state) => {
        state.hidden = false;
      });
    },

    composeReplyOrMentionOrDirectOrQuote() {
      setScoped((state) => {
        state.hidden = true;
      });
    },

    fetchSearchRequest(value) {
      setScoped((state) => {
        state.results = initialState.results;
        state.submitted = true;
        state.submittedValue = value;
      });
    },

    fetchSearchSuccess(results = {}, next) {
      setScoped((state) => {
        const types = ["statuses", "accounts", "groups"];
        types.forEach((type) => {
          const list = results[type] || [];
          state.results[type] = toIds(list);
          state.results[`${type}HasMore`] = list.length >= 20;
          state.results[`${type}Loaded`] = true;
        });

        const tags = results.hashtags || [];
        state.results.hashtags = new Set(tags.map(normalizeTag));
        state.results.hashtagsHasMore = tags.length >= 20;
        state.results.hashtagsLoaded = true;

        state.submitted = true;
        state.next = next || null;
      });
    },

    setSearchFilter(filter) {
      setScoped((state) => {
        state.filter = filter;
      });
    },

    expandSearchRequest(searchType, results = {}, searchTerm, next) {
      setScoped((state) => {
        if (state.value !== searchTerm) return;

        const list = results[searchType] || [];
        state.results[`${searchType}HasMore`] = list.length >= 20;
        state.results[`${searchType}Loaded`] = true;
        state.next = next || null;

        // Directly mutate the Set via Immer
        list.forEach((item) => {
          const entry = searchType === "hashtags" ? normalizeTag(item) : item.id;
          state.results[searchType].add(entry);
        });
      });
    },

    setAccountSearch(accountId) {
      setScoped((state) => {
        if (!accountId) {
          state.results = initialState.results;
          state.submitted = null;
          state.submittedValue = "";
          state.filter = "statuses";
          state.accountId = null;
          return;
        }
      });
    },

    changeSearchAction(value) {
      const actions = getActions();
      if (value.length === 0) {
        actions.clearSearchResults();
      }
      actions.changeSearch(value);
    },

   async submitSearch(filter, newValue) {
      const actions = getActions();
      const state = actions.search;
      const value = newValue ?? state.value;
      const type = filter ?? state.filter;

      if (!value) return;

      actions.fetchSearchRequest(value);

      const params = new URLSearchParams({
        q: value,
        resolve: 'true',
        limit: '20',
        type,
      });
      if (state.accountId) params.append('account_id', state.accountId);

      try {
        const res = await fetch(`/api/v1/search?${params}`);
        if (!res.ok) throw new Error("Search failed");
        
        const data = await res.json();
        const next = typeof res.next === 'function' ? res.next() : null;

        if (data.accounts) actions.importFetchedAccounts(data.accounts);
        if (data.statuses) actions.importFetchedStatuses(data.statuses);

        actions.fetchSearchSuccess(data, next);
        
        if (data.accounts?.length > 0) {
          actions.fetchRelationships(data.accounts.map(a => a.id));
        }
      } catch (error) {
        console.error("Error submitting search:", error);
      }
    },

    async expandSearch(type) {
      const actions = getActions();
      const state = actions.search;
      const offset = state.results[type]?.size || 0;

      let url = state.next;
      const params = new URLSearchParams();

      if (!url) {
        url = '/api/v1/search';
        params.append('q', state.value);
        params.append('type', type);
        params.append('offset', offset.toString());
        if (state.accountId) params.append('account_id', state.accountId);
      }

      try {
        const queryString = params.toString() ? `?${params}` : '';
        const res = await fetch(`${url}${queryString}`);
        if (!res.ok) throw new Error("Expand search failed");
        
        const data = await res.json();
        const next = typeof res.next === 'function' ? res.next() : null;

        if (data.accounts) actions.importFetchedAccounts(data.accounts);
        if (data.statuses) actions.importFetchedStatuses(data.statuses);

        actions.expandSearchRequest(type, data, state.value, next);
      } catch (error) {
        console.error("Error expanding search:", error);
      }
    },

    setFilter(filterType) {
      const actions = getActions();

      // 1. Trigger the search API call with the new filter
      actions.submitSearch(filterType);

      // 2. Update local slice state
      actions.setSearchFilter(filterType);

      // 3. Persist the filter preference to settings
      actions.setSearchFilter?.(['search', 'filter'], filterType);
      
      // 4. Save settings if your store requires an explicit save call
      actions.saveSettings?.();
    },

}};
