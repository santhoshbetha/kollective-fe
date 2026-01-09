
import useBoundStore from '../../stores/boundStore';
import { useGetState } from '../../hooks/useGetState';


function useChangeEntity(entityType) {
  const getState = useGetState();

  function changeEntity(entityId, change) {
    if (!entityId) return;
    const entity = getState().entities[entityType]?.store[entityId];
    if (entity) {
      const newEntity = change(entity);
      useBoundStore.getState().entities.importEntities([newEntity], entityType);
    }
  }

  return { changeEntity };
}

export { useChangeEntity };