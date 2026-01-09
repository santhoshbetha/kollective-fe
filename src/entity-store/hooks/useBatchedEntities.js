import { useEffect } from 'react';
import { z } from 'zod';

import useBoundStore from '../../stores/boundStore.js';
import { useGetState } from '../../hooks/useGetState.js';
import { filteredArray } from '../../schemas/utils.js';

import { selectCache, selectListState, useListState } from '../selectors.js';
import { parseEntitiesPath } from './utils.js';

function useBatchedEntities(
  expandedPath,
  ids,
  entityFn,
  opts = {},
) {
  const getState = useGetState();
  const { entityType, listKey, path } = parseEntitiesPath(expandedPath);
  const schema = opts.schema || z.custom();

  const isEnabled = opts.enabled ?? true;
  const isFetching = useListState(path, 'fetching');
  const lastFetchedAt = useListState(path, 'lastFetchedAt');
  const isFetched = useListState(path, 'fetched');
  const isInvalid = useListState(path, 'invalid');
  const error = useListState(path, 'error');

  /** Get IDs of entities not yet in the store. */
  const filteredIds = useBoundStore((state) => {
    const cache = selectCache(state, path);
    if (!cache) return ids;
    return ids.filter((id) => !cache.store[id]);
  });

  const entityMap = useBoundStore((state) => selectEntityMap(state, path, ids));

  async function fetchEntities() {
    const isFetching = selectListState(getState(), path, 'fetching');
    if (isFetching) return;

    useBoundStore.getState().entities.fetchEntitiesRequest(entityType, listKey);
    try {
      const response = await entityFn(filteredIds);
      const json = await response.json();
      const entities = filteredArray(schema).parse(json);
      useBoundStore.getState().entities.fetchEntitiesSuccess(entities, entityType, listKey, 'end', {
        next: undefined,
        prev: undefined,
        totalCount: undefined,
        fetching: false,
        fetched: true,
        error: null,
        lastFetchedAt: new Date(),
        invalid: false,
      });
    } catch (e) {
      useBoundStore.getState().entities.fetchEntitiesFail(entityType, listKey, e);
    }
  }

  useEffect(() => {
    if (filteredIds.length && isEnabled) {
      fetchEntities();
    }
  }, [filteredIds.length]);

  return {
    entityMap,
    isFetching,
    lastFetchedAt,
    isFetched,
    isError: !!error,
    isInvalid,
  };
}

function selectEntityMap(
  state,
  path,
  entityIds,
) {
  const cache = selectCache(state, path);

  return entityIds.reduce((result, id) => {
    const entity = cache?.store[id];
    if (entity) {
      result[id] = entity;
    }
    return result;
  }, {});
}

export { useBatchedEntities };