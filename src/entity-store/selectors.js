import useBoundStore from "../stores/boundStore";

/** Get cache at path from Redux. */
const selectCache = (state, path) => state.entities[path[0]];

/** Get list at path from Redux. */
const selectList = (state, path) => {
  const [, ...listKeys] = path;
  const listKey = listKeys.join(':');

  return selectCache(state, path)?.lists[listKey];
};

/** Select a particular item from a list state. */
function selectListState(state, path, key) {
  const listState = selectList(state, path)?.state;
  return listState ? listState[key] : undefined;
}

/** Hook to get a particular item from a list state. */
function useListState(path, key) {
  return useBoundStore(state => selectListState(state, path, key));
}

/** Get a single entity by its ID from the store. */
function selectEntity(
  state,
  entityType, id,
) {
  return state.entities[entityType]?.store[id];
}

/** Get list of entities from Redux. */
function selectEntities(state, path) {
  const cache = selectCache(state, path);
  const list = selectList(state, path);

  const entityIds = list?.ids;

  return entityIds ? (
    Array.from(entityIds).reduce((result, id) => {
      const entity = cache?.store[id];
      if (entity) {
        result.push(entity);
      }
      return result;
    }, [])
  ) : [];
}

/** Find an entity using a finder function. */
function findEntity(
  state,
  entityType,
  lookupFn,
) {
  const cache = state.entities[entityType];

  if (cache) {
    return Object.values(cache.store).find(lookupFn);
  }
}

export {
  selectCache,
  selectList,
  selectListState,
  useListState,
  selectEntities,
  selectEntity,
  findEntity,
};