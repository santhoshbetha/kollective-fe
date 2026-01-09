import { z } from 'zod';

import { useEntity } from '../../entity-store/hooks/useEntity';
import { useApi } from '../../hooks/useApi';
import { groupRelationshipSchema } from '../../schemas/group-relationship';

function useGroupRelationship(groupId) {
  const api = useApi();

  const { entity: groupRelationship, ...result } = useEntity(
    ['GroupRelationships', groupId],
    () => api.get(`/api/v1/groups/relationships?id[]=${groupId}`),
    {
      enabled: !!groupId,
      schema: z.array(groupRelationshipSchema).nonempty().transform(arr => arr[0]),
    },
  );

  return {
    groupRelationship,
    ...result,
  };
}

export { useGroupRelationship };