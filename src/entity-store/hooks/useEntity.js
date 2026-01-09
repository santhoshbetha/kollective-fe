import { useEffect, useState, useCallback } from 'react';
import { z } from 'zod';

import useBoundStore from '../../stores/boundStore.js';
import { HTTPError } from '../../api/HttpError.js';
import { useLoading } from '../../hooks/useLoading.js';
import { selectEntity } from '../selectors.js';

function useEntity(
  path,
  entityFn,
  opts = {},
) {
  const [isFetching, setPromise] = useLoading(true);
  const [error, setError] = useState();


  const [entityType, entityId] = path;

  const defaultSchema = z.any();
  const schema = opts.schema || defaultSchema;
  const entity = useBoundStore((state) => selectEntity(state, entityType, entityId));

  const isEnabled = opts.enabled ?? true;
  const isLoading = isFetching && !entity;
  const isLoaded = !isFetching && !!entity;

  const fetchEntity = useCallback(async () => {
    try {
      const response = await setPromise(() => entityFn());
      const json = await response.json();
      const parsed = schema.parse(json);
      // importEntities expects (entityType, entitiesArray, ...)
      useBoundStore.getState().entities.importEntities(entityType, [parsed]);
      setError(undefined);
      return parsed;
    } catch (e) {
      setError(e);
      throw e;
    }
  }, [entityFn, schema, entityType, setPromise]);

  useEffect(() => {
    if (!isEnabled || error) return;
    if (!entity || opts.refetch) {
      // call async to avoid synchronous state updates inside the effect
      (async () => {
        try {
          await fetchEntity();
        } catch {
          // swallow — state is set inside fetchEntity
        }
      })();
    }
  }, [isEnabled, entity, opts.refetch, error, fetchEntity]);

  return {
    entity,
    fetchEntity,
    isFetching,
    isLoading,
    isLoaded,
    error,
    isUnauthorized: error instanceof HTTPError && error.response.status === 401,
    isForbidden: error instanceof HTTPError && error.response.status === 403,
  };
}

export {
  useEntity,
};