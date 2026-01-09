import { useCreateEntity } from '../../entity-store/hooks/useCreateEntity';
import { useApi } from '../../hooks/useApi';
import { groupSchema } from '../../schemas';

function useCreateGroup() {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity(['Groups', 'search', ''], (params) => {
    return api.post('/api/v1/groups', params, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }, { schema: groupSchema });

  return {
    createGroup: createEntity,
    ...rest,
  };
}

export { useCreateGroup };