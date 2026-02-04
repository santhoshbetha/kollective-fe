// src/features/lists/api/useListActions.js
export const useListActions = () => {
  const queryClient = useQueryClient();

  // Create a new list
  const createList = useMutation({
    mutationFn: (title) => api.post('/api/v1/lists', { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });

  // Delete a list
  const deleteList = useMutation({
    mutationFn: (id) => api.delete(`/api/v1/lists/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });

  const addAccountMutation = useMutation({
    mutationFn: (accountId) => 
      api.post(`/api/v1/lists/${listId}/accounts`, { account_ids: [accountId] }),
    onSuccess: () => {
      // Refresh both the list members and the timeline
      queryClient.invalidateQueries({ queryKey: ['lists', listId] });
      queryClient.invalidateQueries({ queryKey: ['statuses', 'list', listId] });
    }
  });

  const addAccountToList = useMutation({
    mutationFn: ({ listId, accountId }) => 
      api.post(`/api/v1/lists/${listId}/accounts`, { account_ids: [accountId] }),
    onSuccess: (_, { listId }) => {
      // Invalidate the membership status for this specific list
      queryClient.invalidateQueries({ queryKey: ['lists', 'membership'] });
    }
  });

  return { createList, deleteList, addAccountMutation, addAccountToList };
};

/*
const AccountMenu = ({ accountId }) => {
  const openAddToList = useListModalStore(s => s.openAddToList);

  return (
    <button onClick={() => openAddToList(accountId)}>
      Add to List...
    </button>
  );
};
*/

//==================================================================================
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useListActions = () => {
  const queryClient = useQueryClient();

  // REPLACES: createList & updateList
  const upsertList = useMutation({
    mutationFn: ({ id, title }) => {
      const method = id ? 'put' : 'post';
      const path = id ? `/api/v1/lists/${id}` : '/api/v1/lists';
      return api[method](path, { title }).then(res => res.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });

  // REPLACES: deleteList
  const deleteList = useMutation({
    mutationFn: (id) => api.delete(`/api/v1/lists/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });

  // REPLACES: addToList & removeFromList
  const toggleMember = useMutation({
    mutationFn: ({ listId, accountId, isMember }) => {
      if (isMember) {
        // Mastodon DELETE for list accounts usually expects params or form-data
        return api.delete(`/api/v1/lists/${listId}/accounts`, { params: { 'account_ids[]': [accountId] } });
      }
      return api.post(`/api/v1/lists/${listId}/accounts`, { account_ids: [accountId] });
    },
    onSuccess: (_, { listId, accountId }) => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', accountId, 'memberships'] });
    }
  });

  return { upsertList, deleteList, toggleMember };
};

//==================================================================================
//"Optimistic Member Toggling"
//To implementOptimistic Member Toggling, you update the cache for both the "Account Memberships" 
// and the "List Members" immediately. This ensures that when an admin clicks a checkbox in the Add to 
// List modal, it flips green instantly without a loading spinner.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useToggleListMember = (listId, accountId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. Mutation Function
    mutationFn: ({ isMember }) => {
      if (isMember) {
        return api.delete(`/api/v1/lists/${listId}/accounts`, { 
          params: { 'account_ids[]': [accountId] } 
        });
      }
      return api.post(`/api/v1/lists/${listId}/accounts`, { 
        account_ids: [accountId] 
      });
    },

    // 2. Optimistic Update
    onMutate: async ({ isMember }) => {
      // Cancel background refetches
      await queryClient.cancelQueries({ queryKey: ['accounts', accountId, 'memberships'] });

      // Snapshot current state
      const previousMemberships = queryClient.getQueryData(['accounts', accountId, 'memberships']);

      // Update the "Where is this user?" cache instantly
      queryClient.setQueryData(['accounts', accountId, 'memberships'], (old) => {
        if (!old) return [];
        return isMember 
          ? old.filter(list => list.id !== listId) // Remove list
          : [...old, { id: listId }];              // Add list
      });

      return { previousMemberships };
    },

    // 3. Rollback on Error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['accounts', accountId, 'memberships'], context.previousMemberships);
    },

    // 4. Sync Server State
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', accountId, 'memberships'] });
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'members'] });
    }
  });
};
/*
const ListCheckbox = ({ list, accountId, currentMemberships }) => {
  const isMember = currentMemberships.some(l => l.id === list.id);
  const { mutate: toggle, isPending } = useToggleListMember(list.id, accountId);

  return (
    <label className="list-toggle-row">
      <input 
        type="checkbox" 
        checked={isMember} 
        onChange={() => toggle({ isMember })}
        disabled={isPending}
      />
      <span>{list.title}</span>
    </label>
  );
};

*/

//==================================================================================
//"Multi-Account Add"
//Use Promise.all within the mutation. Even if you are adding 10 users to 1 list, 
// this ensures the UI remains responsive and the cache invalidates only once at the end.

export const useBulkAddToList = (listId) => {
  const queryClient = useQueryClient();
  const clearSelection = useListSelectionStore((s) => s.clearSelection);

  return useMutation({
    // 1. Batch the requests
    mutationFn: (accountIds) => 
      api.post(`/api/v1/lists/${listId}/accounts`, { account_ids: accountIds }),

    // 2. Optimistic Update: Add all users to the member list cache
    onMutate: async (accountIds) => {
      await queryClient.cancelQueries({ queryKey: ['lists', listId, 'members'] });
      const previous = queryClient.getQueryData(['lists', listId, 'members']);

      // Note: We'd typically pull account data from the 'accounts' cache 
      // to make the optimistic list item look complete
      queryClient.setQueryData(['lists', listId, 'members'], (old) => [
        ...(old || []),
        ...accountIds.map(id => ({ id, placeholder: true }))
      ]);

      return { previous };
    },

    onSuccess: () => {
      toast.success("Accounts added to list");
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'members'] });
    },

    onError: (err, ids, context) => {
      queryClient.setQueryData(['lists', listId, 'members'], context.previous);
    }
  });
};
/*
const BulkAddToolbar = ({ listId }) => {
  const accountIds = useListSelectionStore(s => s.selectedAccountIds);
  const { mutate: bulkAdd, isPending } = useBulkAddToList(listId);

  if (accountIds.length === 0) return null;

  return (
    <div className="bulk-toolbar">
      <span>{accountIds.length} accounts selected</span>
      <button 
        disabled={isPending} 
        onClick={() => bulkAdd(accountIds)}
      >
        {isPending ? 'Adding...' : `Add to List`}
      </button>
    </div>
  );
};

*/



