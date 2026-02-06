import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { groupRelationshipSchema } from '../../../schemas/groupRelationship';
import api from '../../../api/clientN';

export function useGroupRelationship(groupId) {
  return useQuery({
    // Unique key for the membership status of this specific group
    queryKey: ['group-relationships', groupId],

    queryFn: async () => {
      const response = await api.get(`/api/v1/groups/relationships`, {
        params: { 'id[]': [groupId] },
      });
      const data = await response.json();

      // Mirroring the Soapbox logic: API returns an array, we need the first item
      return z.array(groupRelationshipSchema)
        .nonempty()
        .transform(arr => arr[0])
        .parse(data);
    },

    // Standard guard: don't fetch if no ID is provided
    enabled: !!groupId,

    // Social relationships are "volatile." 
    // We set a low staleTime so it refreshes if the user leaves and comes back.
    staleTime: 1000 * 30, // 30 seconds
  });
}

/*
Eliminating the "Partial State" Bug: In the old Redux reducer.ts, if you fetched a group relationship, it lived in Entities.GROUP_RELATIONSHIPS forever. If the user was kicked from the group via another tab/device, the Redux store might still say they are a member. TanStack's staleTime ensures this is periodically verified.
Schema Transformation: Notice that the transform(arr => arr[0]) now happens inside the queryFn. This means the data stored in the TanStack cache is the actual object, not the raw API array. Any component that uses this hook gets the clean, parsed object immediately.
Dependent Refresh: When combined with useGroup, TanStack handles the "Loading" states of both requests in parallel. The UI won't flicker between "Member" and "Not a Member" while the main group data is loading.
*/