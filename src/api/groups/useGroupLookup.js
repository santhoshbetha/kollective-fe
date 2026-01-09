import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useEntityLookup } from '../../entity-store/hooks/useEntityLookup.js';
import { useApi } from '../../hooks/useApi.js';
import { useFeatures } from '../../hooks/useFeatures.js';
import { groupSchema } from '../../schemas/group.js';

import { useGroupRelationship } from './useGroupRelationship.js';

function useGroupLookup(slug) {
  const api = useApi();
  const features = useFeatures();
  const history = useHistory();

  const { entity: group, isUnauthorized, ...result } = useEntityLookup(
    'Groups',
    (group) => group.slug.toLowerCase() === slug.toLowerCase(),
    () => api.get(`/api/v1/groups/lookup?name=${slug}`),
    { schema: groupSchema, enabled: features.groups && !!slug },
  );

  const { groupRelationship: relationship } = useGroupRelationship(group?.id);

  useEffect(() => {
    if (isUnauthorized) {
      history.push('/login');
    }
  }, [isUnauthorized]);

  return {
    ...result,
    isUnauthorized,
    entity: group ? { ...group, relationship: relationship || null } : undefined,
  };
}

export { useGroupLookup };