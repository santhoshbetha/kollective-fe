import { useEntities } from '../../entity-store/hooks/useEntities';
import { useApi } from '../../hooks/useApi';
import { groupTagSchema } from '../../schemas/group-tag';

function useGroupTags(groupId) {
  const api = useApi();

  const { entities, ...result } = useEntities(
    ['GroupTags', groupId],
    () => api.get(`/api/v1/truth/trends/groups/${groupId}/tags`),
    { schema: groupTagSchema },
  );

  return {
    ...result,
    tags: entities,
  };
}

export { useGroupTags };