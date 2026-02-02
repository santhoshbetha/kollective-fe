import { useQueryClient } from '@tanstack/react-query';

export const useStatusImporter = () => {
    const queryClient = useQueryClient();

    const isBroken = (status) => {
      if (!status?.account?.id) return true;
      if (status.reblog && !status.reblog.account?.id) return true;
      return false;
    };

    //In TanStack Query, "Importing" means seeding the cache so that subsequent 
    //queries (like opening a user profile) are instant. This replaces your mergeStatus logic.
    const importStatus = (status, expandSpoilers = false) => {
      // 1. Seed the individual status cache
      queryClient.setQueryData(['statuses', 'detail', status.id], {
        ...status,
        expanded: expandSpoilers // Replaces mergeStatus expandSpoilers logic
      });

      // 2. Seed related entities (like we discussed earlier)
      if (status.account) queryClient.setQueryData(['accounts', status.account.id], status.account);
    };

    const importStatuses = (statuses, expandSpoilers) => {
      statuses.forEach(s => importStatus(s, expandSpoilers));
    };

    const importFetchedStatus = (status) => {
      if (isBroken(status)) return;

      // 1. Recursive handling for Reblogs and Quotes
      // Instead of dispatching, we recursively call the same logic
      const subEntities = [
        status.reblog,
        status.quote,
        status.pleroma?.quote,
        status.reblog?.quote,
        status.reblog?.pleroma?.quote
      ];

      subEntities.forEach(entity => {
        if (entity?.id) importFetchedStatus(entity);
      });

      // 2. Seed the cache for related entities
      // This replaces dispatch(importFetchedAccount)
      if (status.account) {
        queryClient.setQueryData(['account', status.account.id], status.account);
      }

      if (status.poll) {
        queryClient.setQueryData(['poll', status.poll.id], status.poll);
      }

      if (status.group) {
        queryClient.setQueryData(['group', status.group.id], status.group);
      }

      // 3. Finally, seed the status itself
      // This replaces dispatch(importStatus)
      queryClient.setQueryData(['status', status.id], status);
    };

    const importFetchedStatuses = (statuses) => {
      statuses.forEach((status) => {
        if (isBroken(status)) return;

        // 1. Seed the Account
        if (status.account) {
          queryClient.setQueryData(['account', status.account.id], status.account);
        }

        // 2. Seed the Poll
        if (status.poll) {
          queryClient.setQueryData(['poll', status.poll.id], status.poll);
        }

        // 3. Seed Groups (if applicable)
        if (status.group) {
          queryClient.setQueryData(['group', status.group.id], status.group);
        }

        // 4. Seed the Status itself (The main entry)
        queryClient.setQueryData(['status', status.id], status);

        // 5. Recursively handle nested content (Reblogs/Quotes)
        const nested = [status.reblog, status.quote, status.pleroma?.quote];
        const validNested = nested.filter(n => n && n.id);
        
        if (validNested.length > 0) {
          importFetchedStatuses(validNested);
        }
      });
    };

    /*
    Why this is a "Redux-Killer":

    1. Automatic Deduplication: If five different components request relationships 
    for "Account A" at the same time, TanStack Query will only perform one network request.
    2. No chunkArray in Reducers: You don't need to manage the complexity of partial successes or 
    failures in your Redux state.
    3. Simplified State: You can delete the fetchRelationshipsRequest, Success, and Fail actions. 
    The hook provides isLoading and error out of the box.
    */

    const fetchRelatedRelationships = (accounts) => {
      const ids = accounts.map(a => a.id);
      // We don't call a hook here, we trigger a fetch via queryClient
      queryClient.prefetchQuery({
        queryKey: ['relationships', ids.sort()],
        queryFn: () => fetchRelationships(ids)
      });
    };

    return { importStatus, importStatuses, importFetchedStatus, importFetchedStatuses, fetchRelatedRelationships };
};

/* usage example:

const { data } = useQuery({
  queryKey: ['timeline'],
  queryFn: async () => {
    const statuses = await fetchTimeline();
    // Batch import all accounts/polls/quotes into the cache
    statuses.forEach(importFetchedStatus); 
    return statuses;
  }
});


In Redux, you "push" fragments of data into various specialized slices (accounts, polls, statuses). 
In TanStack Query, you flatten and normalize via the Cache API inside your queryFn or a custom hook.

Instead of "dispatching" to different reducers, you use queryClient.setQueryData to seed the cache 
for those entities. This ensures that if you ever navigate to a Profile or a Poll, the data is 
already there (prefetching).

*/

/*========================================================================================

Handling the Account/Profile view so it picks up this "pre-seeded" data automatically

1. The Profile Hook
When you navigate to a profile, you call a hook using the same ['account', id] key you 
used in the importer. Because the data is already in the cache, data will be populated 
immediately on the first render.

export const useAccount = (accountId: string) => {
  return useQuery({
    queryKey: ['account', accountId],
    queryFn: () => fetchAccountFromServer(accountId),
    // staleTime ensures we don't immediately refetch if we just "imported" it
    staleTime: 1000 * 60 * 5, 
  });
};

2. The Component (Instant Render)
Because the importStatusEntities function already ran when the feed loaded, 
the component below will skip the loading state entirely.

const AccountHeader = ({ id }: { id: string }) => {
  const { data: account, isLoading } = useAccount(id);

  // If the importer ran, isLoading will be false immediately!
  if (isLoading && !account) return <Skeleton />;

  return (
    <div>
      <img src={account.avatar} alt={account.username} />
      <h1>{account.display_name}</h1>
      <p>{account.note}</p>
    </div>
  );
};

3. Advanced: Using initialData for Partial Matches
Sometimes the "importer" only gets a partial account object (e.g., just the avatar and name). 
You can use initialData to show the "seeded" version while the background fetch gets the 
full profile details (like follower counts).

const { data } = useQuery({
  queryKey: ['account', accountId],
  queryFn: () => fetchFullProfile(accountId),
  // Pull the "seeded" data from the cache to show immediately
  initialData: () => {
    return queryClient.getQueryData(['account', accountId]);
  },
  // This ensures that even though we have initialData, 
  // it still fetches the full profile in the background
  initialDataUpdatedAt: () => 
    queryClient.getQueryState(['account', accountId])?.dataUpdatedAt,
});

Why this is a "Redux-less" win:

    1. No Selectors: In Redux, you would need useSelector(state => state.accounts[id]). 
       In TanStack, you just use the hook.
    2. Memory Efficiency: If the user scrolls past 100 accounts but never visits their profiles, 
       TanStack Query will eventually garbage collect those account objects based on your gcTime. 
       Redux keeps them forever unless you write custom "cleanup" logic.
    3. Consistency: If an account update comes via WebSocket and you use the helper we built earlier,
       the AccountHeader will auto-update because it's "subscribed" to that cache key.

===================================================================================================
Thinking
In a Mastodon-like app,
Relationship state (Following, Blocked, Muted) is best handled as a separate cache key 
from the Account data.
This is because account data (bio, avatar) is public and static, while relationship data 
is private to the logged-in user and changes frequently.

1. Separate the Query Keys
Instead of nesting "following" inside the Account object, create a specific key for relationships.
This prevents a "Following" toggle from triggering a re-render of the entire Account profile.

// useRelationship.ts
export const useRelationship = (accountId: string) => {
  return useQuery({
    queryKey: ['relationship', accountId],
    queryFn: () => fetchRelationship(accountId), // API: GET /api/v1/accounts/relationships
    staleTime: 1000 * 60 * 30, // Relationships don't change often in background
  });
};

2. Optimistic "Follow" Toggle
When a user clicks "Follow," you want the button to change instantly. 
You use a mutation that updates the specific ['relationship', accountId] key.

const queryClient = useQueryClient();

const followMutation = useMutation({
  mutationFn: (id: string) => api.follow(id),
  
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['relationship', id] });
    const previous = queryClient.getQueryData(['relationship', id]);

    // Optimistically update the "following" boolean
    queryClient.setQueryData(['relationship', id], (old: any) => ({
      ...old,
      following: true,
    }));

    return { previous };
  },
  
  onError: (err, id, context) => {
    queryClient.setQueryData(['relationship', id], context?.previous);
  },
});

3. Syncing with the Importer
You can update your importStatusEntities logic (from earlier) 
to also seed relationships if the API returns them in the initial status payload.

// Inside your importer function
if (status.relationship) {
  queryClient.setQueryData(['relationship', status.account.id], status.relationship);
}

By using TanStack Query, you eliminate the need for the Relationships Reducer entirely. 
The library handles the dictionary-like lookup and the loading/error states for every individual 
user ID automatically.


*/
