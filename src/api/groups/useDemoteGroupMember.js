import { z } from 'zod';

import { useEntityActions } from '../../entity-store/hooks/useEntityActions';
import { groupMemberSchema } from '../../schemas/group-member';

function useDemoteGroupMember(group, groupMember) {
  const { createEntity } = useEntityActions(
    ['GroupMemberships', groupMember.id],
    { post: `/api/v1/groups/${group.id}/demote` },
    { schema: z.array(groupMemberSchema).transform((arr) => arr[0]) },
  );

  return createEntity;
}

export { useDemoteGroupMember };