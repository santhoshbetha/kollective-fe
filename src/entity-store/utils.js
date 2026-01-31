

/** Create an empty entity cache. */
const createCache = () => ({
  store: {},
  lists: {},
});

/** Create an empty entity list state. */
const createListState = () => ({
  next: undefined,
  prev: undefined,
  totalCount: 0,
  error: null,
  fetched: false,
  fetching: false,
  lastFetchedAt: undefined,
  invalid: false,
});
