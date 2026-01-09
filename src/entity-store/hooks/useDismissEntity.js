import useBoundStore from '../../stores/boundStore.js';
import { useLoading } from '../../hooks/useLoading.js';

import { parseEntitiesPath } from './utils.js';

/**
 * Removes an entity from a specific list.
 * To remove an entity globally from all lists, see `useDeleteEntity`.
 */
function useDismissEntity(expandedPath, entityFn) {
  const [isLoading, setPromise] = useLoading();
  const { entityType, listKey } = parseEntitiesPath(expandedPath);

  // TODO: optimistic dismissing
  async function dismissEntity(entityId) {
    const result = await setPromise(entityFn(entityId));
    useBoundStore.getState().entities.dismissEntities([entityId], entityType, listKey);
    return result;
  }

  return {
    dismissEntity,
    isLoading,
  };
}

export { useDismissEntity };