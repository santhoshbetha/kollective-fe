import { useBatchedEntities } from '../../entity-store/hooks/useBatchedEntities';
import { useApi } from '../../hooks/useApi';
import { useLoggedIn } from '../../hooks/useLoggedIn';
import { groupRelationshipSchema } from '../../schemas/group-relationship';

function useGroupRelationships(listKey, ids) {
  const api = useApi();
  const { isLoggedIn } = useLoggedIn();

  function fetchGroupRelationships(ids) {
    const q = ids.map((id) => `id[]=${id}`).join('&');
    return api.get(`/api/v1/groups/relationships?${q}`);
  }

  const { entityMap: relationships, ...result } = useBatchedEntities(
    ['GroupRelationships', ...listKey],
    ids,
    fetchGroupRelationships,
    { schema: groupRelationshipSchema, enabled: isLoggedIn },
  );

  return { relationships, ...result };
}

export { useGroupRelationships };