import { useEntities } from '../../entity-store/hooks/useEntities.js';
import { groupSchema } from '../../schemas/group.js';
import { useApi } from '../../hooks/useApi.js';
import { useFeatures } from '../../hooks/useFeatures.js';

import { useGroupRelationships } from './useGroupRelationships.js';

function usePopularGroups() {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities(
    ['Groups', 'popular'],
    () => api.get('/api/v1/truth/trends/groups'),
    {
      schema: groupSchema,
      enabled: features.groupsDiscovery,
    },
  );

  const { relationships } = useGroupRelationships(['popular'], entities.map(entity => entity.id));

  const groups = entities.map((group) => ({
    ...group,
    relationship: relationships[group.id] || null,
  }));

  return {
    ...result,
    groups,
  };
}

export { usePopularGroups };