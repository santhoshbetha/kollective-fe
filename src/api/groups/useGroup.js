import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useEntity } from '../../entity-store/hooks/useEntity.js';
import { useApi } from '../../hooks/useApi.js';
import { groupSchema } from '../../schemas/group.js';

import useBoundStore from '../../stores/boundStore.js';

function useGroup(groupId, refetch = true) {
  const api = useApi();
  const history = useHistory();

  const { entity: group, isUnauthorized, ...result } = useEntity(
    ['Groups', groupId],
    () => api.get(`/api/v1/groups/${groupId}`),
    {
      schema: groupSchema,
      refetch,
      enabled: !!groupId,
    },
  );
  const relationship = useBoundStore((state) => (state.groupRelationships || {})[groupId] ?? null);

  useEffect(() => {
    if (isUnauthorized) {
      history.push('/login');
    }
  }, [isUnauthorized]);

  return {
    ...result,
    isUnauthorized,
    group: group ? { ...group, relationship: relationship || null } : undefined,
  };
}

export { useGroup };