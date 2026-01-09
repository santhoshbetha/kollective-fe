import { useEntityActions } from "../../entity-store/hooks/useEntityActions";

function useBlockGroupMember(group, account) {
  const { createEntity } = useEntityActions(
    ['GroupMemberships', account.id],
    { post: `/api/v1/groups/${group?.id}/blocks` },
  );

  return createEntity;
}

export { useBlockGroupMember };