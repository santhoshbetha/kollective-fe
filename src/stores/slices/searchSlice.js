import { normalizeTag } from "../../normalizers/tag";

const toIds = (items = []) => {
  return new Set(items.map((item) => item.id));
};

const initialState = {
  value: "",
  submitted: false,
  submittedValue: "",
  hidden: false,
  results: {
    accounts: new Set(),
    statuses: new Set(),
    groups: new Set(),
    hashtags: new Set(), // it's a list of maps
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
export const createSearchSlice = (setScoped, get, rootSet, rootGet) => ({
  ...initialState,

  changeSearch(value) {
    setScoped((state) => {
      state.value = value;
    });
  },

  CalendarSearch() {
    return {
      ...initialState,
    };
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

  fetchSearchSuccess(results, next) {
    setScoped((state) => {
      results = results || {};
      state.results.statuses = toIds(results.statuses);
      state.results.accounts = toIds(results.accounts);
      state.results.groups = toIds(results.groups);
      state.results.hashtags = new Set(results.hashtags.map(normalizeTag)); // it's a list of records
      state.results.accountsHasMore = results.accounts.length >= 20;
      state.results.statusesHasMore = results.statuses.length >= 20;
      state.results.groupsHasMore = results.groups.length >= 20;
      state.results.hashtagsHasMore = results.hashtags.length >= 20;
      state.results.accountsLoaded = true;
      state.results.statusesLoaded = true;
      state.results.groupsLoaded = true;
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

  expandSearchRequest(searchType, results, searchTerm, next) {
    setScoped((state) => {
      if (state.value === searchTerm) {
        results = results || {};
        state.results[`${searchType}HasMore`] =
          results[searchType].length >= 20;
        state.results[`${searchType}Loaded`] = true;
        state.next = next || null;
        state.results[searchType] = new Set([
          ...Array.from(state.results[searchType]),
          ...results[searchType].map((item) =>
            searchType === "hashtags" ? normalizeTag(item) : item.id,
          ),
        ]);
      }
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
    if (value.length == 0) {
      this.clearSearchResults();
      this.changeSearch(value)
    } else {
      this.changeSearch(value)
    } 
  },

  async submitSearch(filter, newValue) {
    const root = rootGet();
    const value = newValue ?? root.search.value;
    const type = filter || root.search.filter || "statuses";
    const accountId = root.search.accountId;

    if (value.length == 0) {
      return;
    }

    this.fetchSearchRequest(value);

    const params = {
      q: value,
      resolve: true,
      limit: 20,
      type,
    };

    if (accountId) params.account_id = accountId;

    try {
      const res = await fetch(`/api/v1/search?` + new URLSearchParams(params), {    
        method: "GET",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch search results");
      }
      const data = await res.json();
      const next = res.next();
      if (data.accounts) {
        this.importer.importFetchedAccounts(data.accounts);
      }
      if (data.statuses) {
        this.importer.importFetchedStatuses(data.statuses);
      }
      root.search.fetchSearchSuccess(data, value, type, next);
      root.accounts.fetchRelationships(data.accounts.map((item) => item.id));
    } catch (error) {
      console.error("Error submitting search:", error);
    }
  },

  setFiler(filterType) {
    const root = rootGet();
    this.submitSearch(filterType);
    this.setSearchFilter(['search', 'filter'],filterType);
    root.settings.setSearchFilter(['search', 'filter'], filterType);
  },

  async expandSearch(type) {
    const root = rootGet();
    const value     = root.search.value;
    const offset    = root.search.results[type].size;
    const accountId = root.search.accountId;

    this.expandSearchRequest(type);

    let url = state.search.next;
    let params= {};

    // if no URL was extracted from the Link header,
    // fall back on querying with the offset
    if (!url) {
      url = '/api/v1/search';
      params = {
        q: value,
        type,
        offset,
      };
      if (accountId) params.account_id = accountId;
    }

    try {
      const res = await fetch(url + new URLSearchParams(params), {
        method: "GET",
      });
      if (!res.ok) {
        throw new Error("Failed to expand search results");
      }
      const data = await res.json();
      const next = res.next();
      if (data.accounts) {
        this.importer.importFetchedAccounts(data.accounts);
      }
      if (data.statuses) {
        this.importer.importFetchedStatuses(data.statuses);
      }
      this.expandSearchSuccess(data, value, type, next);
      root.accounts.fetchRelationships(data.accounts.map((item) => item.id));
    } catch (error) {
      console.error("Error expanding search results:", error);  
    }
  }
});
