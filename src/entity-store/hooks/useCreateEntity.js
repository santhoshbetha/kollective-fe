import { z } from 'zod';

import { HTTPError } from '../../api/HttpError.js';
import { useLoading } from '../../hooks/useLoading.js';
import useBoundStore from '../../stores/boundStore.js';
import { parseEntitiesPath } from './utils.js';

function useCreateEntity(
  expandedPath,
  entityFn,
  opts = {},
) {

  const [isSubmitting, setPromise] = useLoading();
  const { entityType, listKey } = parseEntitiesPath(expandedPath);

  async function createEntity(data, callbacks = {}) {
    try {
      const result = await setPromise(entityFn(data));
      const schema = opts.schema || z.custom();
      const entity = schema.parse(await result.json());

      // TODO: optimistic updating
      useBoundStore.getState().entities.importEntities([entity], entityType, listKey, 'start');

      if (callbacks.onSuccess) {
        callbacks.onSuccess(entity);
      }
    } catch (error) {
      if (error instanceof HTTPError) {
        if (callbacks.onError) {
          callbacks.onError(error);
        }
      } else {
        throw error;
      }
    }
  }

  return {
    createEntity,
    isSubmitting,
  };
}

export { useCreateEntity };