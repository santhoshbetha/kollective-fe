import { useLoading } from '../../hooks/useLoading.js';
import useBoundStore from '../../stores/boundStore.js';
import { parseEntitiesPath } from './utils.js';

/**
 * Increases (or decreases) the `totalCount` in the entity list by the specified amount.
 * This only works if the API returns an `X-Total-Count` header and your components read it.
 */
function useIncrementEntity(
  expandedPath,
  diff,
  entityFn,
) {
  const [isLoading, setPromise] = useLoading();
  const { entityType, listKey } = parseEntitiesPath(expandedPath);

  async function incrementEntity(entityId) {
    useBoundStore.getState().entities.incrementEntities(entityType, listKey, diff);
    try {
      await setPromise(entityFn(entityId));
    } catch (e) {
      useBoundStore.getState().entities.incrementEntities(entityType, listKey, diff * -1);
    }
  }

  return {
    incrementEntity,
    isLoading,
  };
}

export { useIncrementEntity };