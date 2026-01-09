import { useEntities } from '../../entity-store/hooks/useEntities';
import { useApi } from '../../hooks/useApi';
import { useFeatures } from '../../hooks/useFeatures';
import { groupSchema } from '../../schemas';

function useGroupMutes() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities(
    ['GroupMutes'],
    () => api.get('/api/v1/groups/mutes'),
    { schema: groupSchema, enabled: features.groupsMuting },
  );

  return {
    ...result,
    mutes: entities,
  };
}

export { useGroupMutes };