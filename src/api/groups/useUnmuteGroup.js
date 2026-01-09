import { useEntityActions } from "../../entity-store/hooks/useEntityActions";
import { groupRelationshipSchema } from "../../schemas/group-relationship.js";

function useUnmuteGroup(group) {
  const { createEntity, isSubmitting } = useEntityActions(
    ['GroupRelationships', group?.id],
    { post: `/api/v1/groups/${group?.id}/unmute` },
    { schema: groupRelationshipSchema },
  );

  return {
    mutate: createEntity,
    isSubmitting,
  };
}

export { useUnmuteGroup };