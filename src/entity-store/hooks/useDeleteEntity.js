import { useGetState } from '../../hooks/useGetState';
import { useLoading } from '../../hooks/useLoading';
import useBoundStore from '../../stores/boundStore';

/**
 * Optimistically deletes an entity from the store.
 * This hook should be used to globally delete an entity from all lists.
 * To remove an entity from a single list, see `useDismissEntity`.
 */
function useDeleteEntity(
  entityType,
  entityFn,
) {

  const getState = useGetState();
  const [isSubmitting, setPromise] = useLoading();

  async function deleteEntity(entityId, callbacks = {}) {
    // Get the entity before deleting, so we can reverse the action if the API request fails.
    const entity = getState().entities[entityType]?.store[entityId];

    // Optimistically delete the entity from the _store_ but keep the lists in tact.
    useBoundStore.getState().entities.deleteEntities([entityId], entityType, { preserveLists: true });

    try {
      await setPromise(entityFn(entityId));

      // Success - finish deleting entity from the state.
      useBoundStore.getState().entities.deleteEntities([entityId], entityType);

      if (callbacks.onSuccess) {
        callbacks.onSuccess(entityId);
      }
    } catch (e) {
      if (entity) {
        // If the API failed, reimport the entity.
        useBoundStore.getState().entities.importEntities([entity], entityType);
      }

      if (callbacks.onError) {
        callbacks.onError(e);
      }
    }
  }

  return {
    deleteEntity,
    isSubmitting,
  };
}

export { useDeleteEntity };