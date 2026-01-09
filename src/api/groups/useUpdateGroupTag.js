import { useEntityActions } from '../../entity-store/hooks/useEntityActions';

function useUpdateGroupTag(groupId, tagId) {
  const { updateEntity, ...rest } = useEntityActions(
    ['GroupTags', groupId, tagId],
    { patch: `/api/v1/groups/${groupId}/tags/${tagId}` },
  );

  return {
    updateGroupTag: updateEntity,
    ...rest,
  };
}

export { useUpdateGroupTag };