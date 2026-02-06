//Entities

/src/entity-store/reducer.ts :
In a Mastodon-like social application, the code in
entity-store/reducer.ts serves as a centralized system for managing data objects, such as users and posts, 
using a normalized Redux state. Its purpose is to act as a "master reducer" for entity collections 
in the stored cache, providing a unified way to perform Create, Read, Update, and Delete operations. 
This approach standardizes data management and simplifies converting backend API responses into
the application's internal model classes.

In a Mastodon-like app, the
entity-store/reducer.ts handles complex "normalization" (mapping IDs to data objects). Replacing this with 
TanStack Query shifts the mental model from "managing a local database" to "caching server snapshots"

Comparison: Updating a Post Like
In the original Redux code, you would dispatch an action, and the reducer would manually find the post 
in a large nested object to toggle its favourited state.

1. Redux Approach (Manual Normalization)
You must define the exact state transition logic within the reducer.
// reducer.ts snippet
case 'UPDATE_ENTITY':
  return {
    ...state,
    [action.entityType]: {
      ...state[action.entityType],
      [action.id]: { ...state[action.entityType][action.id], ...action.data }
    }
  };
2. TanStack Query Approach (Cache Invalidation)
Instead of a complex reducer, you use a mutation that updates the server and then tells the cache to 
refresh the relevant data. 
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => api.post(`/api/v1/statuses/${postId}/favourite`),
    // Option A: Simply refresh the data from the server
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    // Option B: Optimistic Update (UI updates instantly)
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData(['posts']);
      
      // Manually "patch" the cache without a reducer
      queryClient.setQueryData(['posts'], (old: any) => 
        old.map((p: any) => p.id === postId ? { ...p, favourited: true } : p)
      );
      
      return { previousPosts };
    },
    // Rollback if server fails
    onError: (err, postId, context) => {
      queryClient.setQueryData(['posts'], context?.previousPosts);
    },
  });
};

Key Differences

1.Boilerplate: TanStack Query removes the need for action types, action creators, and the reducer.ts 
    file itself.
2. Source of Truth: Redux treats the local store as the primary source; TanStack Query treats the server 
    as the source and your local code as a temporary cache.
3. Complexity: For "Mastodon-sized" data, Redux's manual normalization (like the code you linked) can 
    become a performance bottleneck; TanStack Query handles this with automated background refetching.
===========================================================================================================
 In a Mastodon-style application using the Soapbox
 entity-store, hooks and actions manage a local cache for entities like users or posts, ensuring consistency 
 across the interface []. The typical sequence of operations when the app loads involves initial data fetching,
 processing via the importEntities action, and components subscribing to entity updates using hooks like
 useStatus or useAccount []. Data retrieval hooks, such as useAccount(id), are used to access existing 
 data in the store, while action hooks, like useFetchAccount(id), handle fetching data and triggering
 updates []. Key actions include importEntities for processing raw API data, updateEntity for making 
 small data modifications, and removeEntity for deleting entities from the store []. 
===========================================================================================================
1. Replace importEntities with setQueryData
In the Soapbox code, importEntities is used to force data into the store. In TanStack, you either 
let the query handle it automatically or use setQueryData for manual updates. 

Redux Logic: dispatch(importEntities([user], Entities.ACCOUNTS))
TanStack Logic: 
    const queryClient = useQueryClient();
    queryClient.setQueryData(['accounts', user.id], user);

-------------------------------------------------------------
2. Replace Entity Hooks with useQuery
The custom hooks like useAccount(id) or useStatus(id) are replaced by a standardized useQuery call using a unique Query Key. 
Soapbox Hook 	            TanStack Replacement
useAccount(id)	            useQuery({ queryKey: ['accounts', id], queryFn: () => fetchAccount(id) })
useStatus(id)	            useQuery({ queryKey: ['statuses', id], queryFn: () => fetchStatus(id) })
useFetchAccount(id)     	Handled automatically by useQuery on mount.
---------------------------------------------------------------
3. Replace updateEntity with Mutations
Instead of a reducer case that modifies a nested object, use useMutation. When the server update succeeds, 
you either invalidate the query to trigger a fresh fetch or patch the cache for an instant UI update. 

const mutation = useMutation({
  mutationFn: updateAccountApi,
  onSuccess: (updatedUser) => {
    // Invalidate to refresh everything related to this user
    queryClient.invalidateQueries({ queryKey: ['accounts', updatedUser.id] });
    // OR: Manually update the specific cache entry
    queryClient.setQueryData(['accounts', updatedUser.id], updatedUser);
  },
});
--------------------------------------------------------------------
4. Handling the "Load Sequence"
In a TanStack-based app, the sequence is decentralized: 

   1. Initial Load: The App or Timeline component calls useQuery(['timeline']).
   2. Automatic Caching: TanStack fetches the data and stores it under that key.
   3. Cross-Component Sync: If a UserAvatar component also calls useQuery(['accounts', id]), 
      TanStack checks if that data is already in the cache from the timeline fetch. 
      If so, it returns it instantly without a new network request.

Key Benefits of the Switch

    No Reducer Maintenance: You delete the reducer.ts file entirely.
    Automatic Loading/Error States: No more manual isLoading variables in your store.
    Background Refetching: The app stays in sync automatically when the user refocuses the 
    window or navigates back. 
======================================================================================================