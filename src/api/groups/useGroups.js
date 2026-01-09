import { useEntities } from '../../entity-store/hooks/useEntities.js';
import { useApi } from '../../hooks/useApi.js';
import { useFeatures } from '../../hooks/useFeatures.js';
import { groupSchema } from '../../schemas/group.js';

import { useGroupRelationships } from './useGroupRelationships.ts';

function useGroups(q = '') {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities(
    ['Groups', 'search', q],
    () => api.get('/api/v1/groups', { searchParams: { q } }),
    { enabled: features.groups, schema: groupSchema },
  );
  const { relationships } = useGroupRelationships(
    ['search', q],
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

export { useGroups };
