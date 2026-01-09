import { useEntities } from '../../entity-store/hooks/useEntities.js';
import { useApi } from '../../hooks/useApi.js';
import { useFeatures } from '../../hooks/useFeatures.js';
import { groupSchema } from '../../schemas/group.js';

import { useGroupRelationships } from './useGroupRelationships.js';

function useGroupsFromTag(tagId) {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities(
    ['Groups', 'tags', tagId],
    () => api.get(`/api/v1/tags/${tagId}/groups`),
    {
      schema: groupSchema,
      enabled: features.groupsDiscovery,
    },
  );
  const { relationships } = useGroupRelationships(
    ['tags', tagId],
    entities.map(entity => entity.id),
  );

  const groups = entities.map((group) => ({
    ...group,
    relationship: relationships[group.id] || null,
  }));

  return {
    ...result,
    groups,
  };
}

export { useGroupsFromTag };