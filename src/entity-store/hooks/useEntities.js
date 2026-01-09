import LinkHeader from 'http-link-header';
import { useEffect } from 'react';
import z from 'zod';

import { useApi } from '../../hooks/useApi.js';
import useBoundStore from '../../stores/boundStore.js';
import { useGetState } from '../../hooks/useGetState.js';
import { filteredArray } from '../../schemas/utils.js';
import { realNumberSchema } from '../../utils/numbers.jsx';

import { selectEntities, selectListState, useListState } from '../selectors.js';
import { parseEntitiesPath } from './utils.js';

/** A hook for fetching and displaying API entities. */
function useEntities(
  /** Tells us where to find/store the entity in the cache. */
  expandedPath,
  /** API route to GET, eg `'/api/v1/notifications'`. If undefined, nothing will be fetched. */
  entityFn,
  /** Additional options for the hook. */
  opts,
) {
  const api = useApi();
  const dispatch = useAppDispatch();
  const getState = useGetState();

  const { entityType, listKey, path } = parseEntitiesPath(expandedPath);
  const entities = useBoundStore(state => selectEntities(state, path));
  const schema = opts.schema || z.custom();

  const isEnabled = opts.enabled ?? true;
  const isFetching = useListState(path, 'fetching');
  const lastFetchedAt = useListState(path, 'lastFetchedAt');
  const isFetched = useListState(path, 'fetched');
  const isError = !!useListState(path, 'error');
  const totalCount = useListState(path, 'totalCount');
  const isInvalid = useListState(path, 'invalid');

  const next = useListState(path, 'next');
  const prev = useListState(path, 'prev');

  const fetchPage = async(req, pos, overwrite = false) => {
    // Get `isFetching` state from the store again to prevent race conditions.
    const isFetching = selectListState(getState(), path, 'fetching');
    if (isFetching) return;

    useBoundStore.getState().entities.fetchEntitiesRequest(entityType, listKey);
    try {
      const response = await req();
      const json = await response.json();
      const entities = filteredArray(schema).parse(json);
      const parsedCount = realNumberSchema.safeParse(response.headers.get('x-total-count'));
      const totalCount = parsedCount.success ? parsedCount.data : undefined;
      const linkHeader = response.headers.get('link');
      const links = linkHeader ? new LinkHeader(linkHeader) : undefined;

      useBoundStore.getState().entities.fetchEntitiesSuccess(entities, entityType, listKey, pos, {
        next: links?.refs.find((link) => link.rel === 'next')?.uri,
        prev: links?.refs.find((link) => link.rel === 'prev')?.uri,
        totalCount: Number(totalCount) >= entities.length ? totalCount : undefined,
        fetching: false,
        fetched: true,
        error: null,
        lastFetchedAt: new Date(),
        invalid: false,
      }, overwrite);
    } catch (error) {
      useBoundStore.getState().entities.fetchEntitiesFail(entityType, listKey, error);
    }
  };

  const fetchEntities = async() => {
    await fetchPage(entityFn, 'end', true);
  };

  const fetchNextPage = async() => {
    if (next) {
      await fetchPage(() => api.get(next), 'end');
    }
  };

  const fetchPreviousPage = async() => {
    if (prev) {
      await fetchPage(() => api.get(prev), 'start');
    }
  };

  const invalidate = () => {
    useBoundStore.getState().entities.invalidateEntitiesList(entityType, listKey);
  };

  const staleTime = opts.staleTime ?? 60000;

  useEffect(() => {
    if (!isEnabled) return;
    if (isFetching) return;
    const isUnset = !lastFetchedAt;
    const isStale = lastFetchedAt ? Date.now() >= lastFetchedAt.getTime() + staleTime : false;

    if (isInvalid || isUnset || isStale) {
      fetchEntities();
    }
  }, [isEnabled, ...path]);

  return {
    entities,
    fetchEntities,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage: !!next,
    hasPreviousPage: !!prev,
    totalCount,
    isError,
    isFetched,
    isFetching,
    isLoading: isFetching && entities.length === 0,
    invalidate,
    /** The `X-Total-Count` from the API if available, or the length of items in the store. */
    count: typeof totalCount === 'number' ? totalCount : entities.length,
  };
}

export {
  useEntities,
};