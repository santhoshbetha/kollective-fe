import { useQueryClient } from '@tanstack/react-query';
import { fetchRelationships } from '../../accounts/api/accounts';

export const usePostImporter = () => {
    const queryClient = useQueryClient();

    const isBroken = (post) => {
      if (!post?.account?.id) return true;
      if (post.reblog && !post.reblog.account?.id) return true;
      return false;
    };

    //In TanStack Query, "Importing" means seeding the cache so that subsequent 
    //queries (like opening a user profile) are instant. This replaces your mergePost logic.
    
    //Keep this for single-post imports (like after a post or update)
    const importPost = (post, expandSpoilers = false) => {
      if (isBroken(post)) return;

      // 1. Seed the individual post cache
      queryClient.setQueryData(['post', post.id], {
        ...post,
        expanded: expandSpoilers // Replaces mergePost expandSpoilers logic
      });

      // 2. Seed related entities (like we discussed earlier)
      if (post.account) {
        queryClient.setQueryData(['account', post.account.id], post.account);
      }
    };

    const importposts = (posts, expandSpoilers) => {
      posts.forEach(s => importPost(s, expandSpoilers));
    };

    const importFetchedPost = (post) => {
      if (isBroken(post)) return;

      // 1. Recursive handling for Reblogs and Quotes
      // Instead of dispatching, we recursively call the same logic
      const subEntities = [
        post.reblog,
        post.quote,
        post.kollective?.quote,
        post.reblog?.quote,
        post.reblog?.kollective?.quote
      ];

      subEntities.forEach(entity => {
        if (entity?.id) importFetchedPost(entity);
      });

      // 2. Seed the cache for related entities
      // This replaces dispatch(importFetchedAccount)
      if (post.account) {
        queryClient.setQueryData(['account', post.account.id], post.account);
      }

      if (post.poll) {
        queryClient.setQueryData(['poll', post.poll.id], post.poll);
      }

      if (post.group) {
        queryClient.setQueryData(['group', post.group.id], post.group);
      }

      // 3. Finally, seed the post itself
      // This replaces dispatch(importPost)
      queryClient.setQueryData(['post', post.id], post);
    };

    const importFetchedPosts = (posts) => {
       if (!Array.isArray(posts)) return;

      posts.forEach((post) => {
        if (isBroken(post)) return;

        // 1. Seed the Account
        // 1. Account
        if (post.account) {
          queryClient.setQueryData(['account', post.account.id], post.account);
        }

        // 2. Seed the Poll
        if (post.poll) {
          queryClient.setQueryData(['poll', post.poll.id], post.poll);
        }

        // 3. Seed Groups (if applicable)
        if (post.group) {
          queryClient.setQueryData(['group', post.group.id], post.group);
        }

        // 4. Seed the Post itself (The main entry)
        // (Matches our usePost queryKey: ['post', postId])
        queryClient.setQueryData(['post', post.id], post);

        // 5. Handle Nesting (Reblogs / Quotes)
        const nested = [post.reblog, post.quote, post.kollective?.quote]
          .filter(n => n && n.id && n.id !== post.id); 
        
        if (nested.length > 0) {
          importFetchedPosts(nested);
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
      const ids = accounts.map(a => a.id).filter(Boolean);
      if (ids.length === 0) return;
      // We don't call a hook here, we trigger a fetch via queryClient
      queryClient.prefetchQuery({
        queryKey: ['relationships', ids.sort().join(',')],
        queryFn: () => fetchRelationships(ids) // Assume this is your API util
      });
    };

    return { importPost, importposts, importFetchedPost, importFetchedPosts, fetchRelatedRelationships };
};

/* usage example:

const { data } = useQuery({
  queryKey: ['timeline'],
  queryFn: async () => {
    const posts= await fetchTimeline();
    // Batch import all accounts/polls/quotes into the cache
    posts.forEach(importFetchedPost); 
    return posts;
  }
});


In Redux, you "push" fragments of data into various specialized slices (accounts, polls, posts). 
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
Because the importPostEntities function already ran when the feed loaded, 
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
You can update your importPostEntities logic (from earlier) 
to also seed relationships if the API returns them in the initial post payload.

// Inside your importer function
if (post.relationship) {
  queryClient.setQueryData(['relationship', post.account.id], post.relationship);
}

By using TanStack Query, you eliminate the need for the Relationships Reducer entirely. 
The library handles the dictionary-like lookup and the loading/error states for every individual 
user ID automatically.


*/
