import { useEntityActions } from '../../entity-store/hooks/useEntityActions';

function useDeleteGroup() {
  const { deleteEntity, isSubmitting } = useEntityActions(
    ['Groups'],
    { delete: '/api/v1/groups/:id' },
  );

  return {
    mutate: deleteEntity,
    isSubmitting,
  };
}

export { useDeleteGroup };