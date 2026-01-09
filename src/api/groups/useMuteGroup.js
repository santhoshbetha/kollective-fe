import { useEntityActions } from '../../entity-store/hooks/useEntityActions.js';
import { groupRelationshipSchema } from '../../schemas/group-relationship.js';

function useMuteGroup(group) {
  const { createEntity, isSubmitting } = useEntityActions(
    ['GroupRelationships', group?.id],
    { post: `/api/v1/groups/${group?.id}/mute` },
    { schema: groupRelationshipSchema },
  );

  return {
    mutate: createEntity,
    isSubmitting,
  };
}

export { useMuteGroup };