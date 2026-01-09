import { useEntities } from '../../entity-store/hooks/useEntities.js';
import { useApi } from '../../hooks/useApi.js';
import { useFeatures } from '../../hooks/useFeatures.js';
import { groupSchema } from '../../schemas/group.js';

import { useGroupRelationships } from './useGroupRelationships.ts';

function useSuggestedGroups() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities(
    ['Groups', 'suggested'],
    () => api.get('/api/v1/truth/suggestions/groups'),
    {
      schema: groupSchema,
      enabled: features.groupsDiscovery,
    },
  );

  const { relationships } = useGroupRelationships(['suggested'], entities.map(entity => entity.id));

  const groups = entities.map((group) => ({
    ...group,
    relationship: relationships[group.id] || null,
  }));

  return {
    ...result,
    groups,
  };
}

export { useSuggestedGroups };