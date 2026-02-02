import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

// REPLACES: fetchGroups & fetchGroupRelationships
export const useGroups = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['groups', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/groups');
      
      // SIDE-LOADING: Seed individual group caches and prefetch relationships
      const ids = data.map(g => g.id);
      data.forEach(group => queryClient.setQueryData(['groups', 'detail', group.id], group));
      
      // Trigger relationship fetch immediately
      queryClient.prefetchQuery({
        queryKey: ['groups', 'relationships', ids.sort()],
        queryFn: () => fetchGroupRelationships(ids)
      });

      return data;
    },
  });
};

// REPLACES: fetchGroup
export const useGroup = (id) => useQuery({
  queryKey: ['groups', 'detail', id],
  queryFn: () => api.get(`/api/v1/groups/${id}`).then(res => res.data),
  enabled: !!id,
});

// REPLACES: fetchGroupRelationships
export const useGroupRelationship = (id) => useQuery({
  queryKey: ['groups', 'relationship', id],
  queryFn: () => api.get('/api/v1/groups/relationships', { params: { 'id[]': [id] } })
    .then(res => res.data[0]),
  enabled: !!id,
});

export const useGroupBlocks = (groupId) => {
  const { importAccounts } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['groups', groupId, 'blocks'],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/api/v1/groups/${groupId}/blocks`, {
        params: { max_id: pageParam }
      });
      // Side-load accounts
      importAccounts(response.data);
      return {
        items: response.data,
        next: extractMaxIdFromLink(response.headers.get('Link'))
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.next,
  });
};

//=============================================================================================
// src/features/groups/api/useGroups.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { extractMaxIdFromLink } from '@/utils/apiUtils';

export const useGroupMembershipRequests = (groupId) => {
  const { importAccounts } = useStatusImporter();

  return useInfiniteQuery({
    queryKey: ['groups', groupId, 'membership-requests'],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/api/v1/groups/${groupId}/membership_requests`, {
        params: { max_id: pageParam, limit: 20 }
      });
      
      // SIDE-LOADING: Seed the account cache
      importAccounts(response.data);

      return {
        items: response.data,
        next: extractMaxIdFromLink(response.headers.get('Link'))
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: !!groupId,
  });
};

// src/features/groups/api/useGroupActions.js
export const useHandleGroupRequest = (groupId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // action is 'authorize' or 'reject'
    mutationFn: ({ accountId, action }) => 
      api.post(`/api/v1/groups/${groupId}/membership_requests/${accountId}/${action}`),

    // OPTIMISTIC UPDATE: Remove the user from the requests list immediately
    onMutate: async ({ accountId }) => {
      await queryClient.cancelQueries({ queryKey: ['groups', groupId, 'membership-requests'] });
      const previous = queryClient.getQueryData(['groups', groupId, 'membership-requests']);

      queryClient.setQueryData(['groups', groupId, 'membership-requests'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.filter(item => item.id !== accountId)
          }))
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['groups', groupId, 'membership-requests'], context.previous);
    },
    onSuccess: (_, { action }) => {
      if (action === 'authorize') {
        // If authorized, refresh the members list to show the new user
        queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
      }
    }
  });
};

/*
const MembershipRequestItem = ({ groupId, account }) => {
  const { mutate: handleRequest, isPending } = useHandleGroupRequest(groupId);

  return (
    <div className="request-row">
      <span>{account.username}</span>
      <div className="actions">
        <button 
          onClick={() => handleRequest({ accountId: account.id, action: 'authorize' })}
          disabled={isPending}
        >
          Approve
        </button>
        <button 
          onClick={() => handleRequest({ accountId: account.id, action: 'reject' })}
          disabled={isPending}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

*/



