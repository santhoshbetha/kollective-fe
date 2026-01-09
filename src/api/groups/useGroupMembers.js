
import useEntities from '../../entity-store/hooks/useEntities.js';
import { GroupRoles } from '../../schemas/group-member.js';
import { groupMemberSchema } from '../../schemas/group-member.js';

import { useApi } from '../../../hooks/useApi.ts';

function useGroupMembers(groupId, role) {
  const api = useApi();

  const { entities, ...result } = useEntities(
    ['GroupMemberships', groupId, role],
    () => api.get(`/api/v1/groups/${groupId}/memberships?role=${role}`),
    { schema: groupMemberSchema },
  );

  return {
    ...result,
    groupMembers: entities,
  };
}

export { useGroupMembers };