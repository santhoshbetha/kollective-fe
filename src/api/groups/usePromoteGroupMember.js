import { z } from 'zod';

import { useEntityActions } from '../../entity-store/hooks/useEntityActions';
import { groupMemberSchema } from '../../schemas/group-member';

function usePromoteGroupMember(group, groupMember) {
  const { createEntity } = useEntityActions(
    ['GroupMemberships', groupMember.account.id],
    { post: `/api/v1/groups/${group.id}/promote` },
    { schema: z.array(groupMemberSchema).transform((arr) => arr[0]) },
  );

  return createEntity;
}

export { usePromoteGroupMember };