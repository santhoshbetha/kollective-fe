import { useCreateEntity } from '../../entity-store/hooks/useCreateEntity';
import { useApi } from '../../hooks/useApi';
import { groupSchema } from '../../schemas';

function useUpdateGroup(groupId) {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity(["Groups"], (params) => {
    return api.put(`/api/v1/groups/${groupId}`, params, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }, { schema: groupSchema });

  return {
    updateGroup: createEntity,
    ...rest,
  };
}

export { useUpdateGroup };
