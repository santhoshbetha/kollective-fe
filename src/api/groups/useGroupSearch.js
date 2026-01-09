import { useEntities } from '../../entity-store/hooks/useEntities.js';
import { useApi } from '../../hooks/useApi.js';
import { useFeatures } from '../../hooks/useFeatures.js';
import { groupSchema } from '../../schemas/group.js';

import { useGroupRelationships } from './useGroupRelationships.js';


function useGroupSearch(search) {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...result } = useEntities(
    ['Groups', 'discover', 'search', search],
    () => api.get('/api/v1/groups/search', {
      searchParams: {
        q: search,
      },
    }),
    { enabled: features.groupsDiscovery && !!search, schema: groupSchema },
  );

  const { relationships } = useGroupRelationships(
    ['discover', 'search', search],
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

export { useGroupSearch };