import { useApi } from '../../hooks/useApi.js';

import { useCreateEntity } from './useCreateEntity.js';
import { useDeleteEntity } from './useDeleteEntity.js';
import { parseEntitiesPath } from './utils.js';

function useEntityActions(
  expandedPath,
  endpoints,
  opts,
) {
  const api = useApi();
  const { entityType, path } = parseEntitiesPath(expandedPath);

  const { deleteEntity, isSubmitting: deleteSubmitting } =
    useDeleteEntity(entityType, (entityId) => api.delete(endpoints.delete.replace(/:id/g, entityId)));

  const { createEntity, isSubmitting: createSubmitting } =
    useCreateEntity(path, (data) => api.post(endpoints.post, data), opts);

  const { createEntity: updateEntity, isSubmitting: updateSubmitting } =
    useCreateEntity(path, (data) => api.patch(endpoints.patch, data), opts);

  return {
    createEntity,
    deleteEntity,
    updateEntity,
    isSubmitting: createSubmitting || deleteSubmitting || updateSubmitting,
  };
}

export { useEntityActions };