import { useDismissEntity, useEntities } from "../../entity-store/hooks/useDismissEntity";
import { useApi } from "../../hooks/useApi";
import { GroupRoles } from "../../schemas/group-member";
import { accountSchema } from "../../schemas";
import { useGroupRelationship } from './useGroupRelationship.js';

function useGroupMembershipRequests(groupId) {
  const api = useApi();
  const path = ['Accounts', 'membership_requests', groupId];

  const { groupRelationship: relationship } = useGroupRelationship(groupId);

  const { entities, invalidate, fetchEntities, ...rest } = useEntities(
    path,
    () => api.get(`/api/v1/groups/${groupId}/membership_requests`),
    {
      schema: accountSchema,
      enabled: relationship?.role === GroupRoles.OWNER || relationship?.role === GroupRoles.ADMIN,
    },
  );

  const { dismissEntity: authorize } = useDismissEntity(path, async (accountId) => {
    const response = await api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/authorize`);
    invalidate();
    return response;
  });

  const { dismissEntity: reject } = useDismissEntity(path, async (accountId) => {
    const response = await api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/reject`);
    invalidate();
    return response;
  });

  return {
    accounts: entities,
    refetch: fetchEntities,
    authorize,
    reject,
    ...rest,
  };
}

export { useGroupMembershipRequests };