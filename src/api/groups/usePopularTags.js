import { useEntities } from '../../entity-store/hooks/useEntities';
import { useApi } from '../../hooks/useApi';
import { useFeatures } from '../../hooks/useFeatures.js';
import { groupTagSchema } from '../../schemas/group-tag';

function usePopularTags() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities(
    ['GroupTags'],
    () => api.get('/api/v1/groups/tags'),
    {
      schema: groupTagSchema,
      enabled: features.groupsDiscovery,
    },
  );

  return {
    ...result,
    tags: entities,
  };
}

export { usePopularTags };