import { useCreateEntity } from '../../entity-store/hooks/useCreateEntity';
import { useApi } from '../../hooks/useApi';
import { useOwnAccount } from '../../hooks/useOwnAccount';

function useCancelMembershipRequest(group) {
  const api = useApi();
  const { account: me } = useOwnAccount();

  const { createEntity, isSubmitting } = useCreateEntity(
    ['GroupRelationships'],
    () => api.post(`/api/v1/groups/${group.id}/membership_requests/${me?.id}/reject`),
  );

  return {
    mutate: createEntity,
    isSubmitting,
  };
}

export { useCancelMembershipRequest };
