import { useEffect, useState, useCallback } from 'react';
import { z } from 'zod';

import { HTTPError } from '../../api/HttpError.js';
import useBoundStore from '../../stores/boundStore.js';
import { useLoading } from '../../hooks/useLoading.js';

import { findEntity } from '../selectors.js';

function useEntityLookup(
  entityType,
  lookupFn,
  entityFn,
  opts = {},
) {
  const { schema = z.custom() } = opts;

  const [fetchedEntity, setFetchedEntity] = useState();
  const [isFetching, setPromise] = useLoading(true);
  const [error, setError] = useState();

  const { entity } = useBoundStore(state => ({
    entity: findEntity(state, entityType, lookupFn) ?? fetchedEntity,
  }));
  const isEnabled = opts.enabled ?? true;
  const isLoading = isFetching && !entity;

  const fetchEntity = useCallback(async () => {
    try {
      const response = await setPromise(entityFn());
      const json = await response.json();
      const entity = schema.parse(json);
      setFetchedEntity(entity);
      // importEntities was standardized to accept (entityType, entitiesArray, ...)
      useBoundStore.getState().entities.importEntities(entityType, [entity]);
    } catch (e) {
      setError(e);
    }
  }, [entityFn, schema, setPromise, entityType]);

  useEffect(() => {
    if (!isEnabled) return;

    if (!entity || opts.refetch) {
      // Schedule fetch on microtask queue to avoid triggering synchronous setState during render
      void Promise.resolve().then(() => fetchEntity());
    }
  }, [isEnabled, entity, opts.refetch, fetchEntity]);

  return {
    entity,
    fetchEntity,
    isFetching,
    isLoading,
    isUnauthorized: error instanceof HTTPError && error.response.status === 401,
    isForbidden: error instanceof HTTPError && error.response.status === 403,
  };
}

export { useEntityLookup };