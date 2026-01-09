import { useEntityActions } from '../../entity-store/hooks/useEntityActions.js';
import { groupRelationshipSchema } from '../../schemas/group-relationship.js';

import { useGroups } from './useGroups.js';

function useLeaveGroup(group) {
  const { invalidate } = useGroups();

  const { createEntity, isSubmitting } = useEntityActions(
    ['GroupRelationships', group.id],
    { post: `/api/v1/groups/${group.id}/leave` },
    { schema: groupRelationshipSchema },
  );

  return {
    mutate: createEntity,
    isSubmitting,
    invalidate,
  };
}

export { useLeaveGroup };
