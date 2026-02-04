import { useQuery, useQueryClient } from '@tanstack/react-query';
import { filteredArray } from '@/schemas/utils.js';

export function useBatchedEntities(
  expandedPath, // e.g., ['relationships', 'home']
  ids,
  entityFn,
  opts = {}
) {
  const queryClient = useQueryClient();
  const schema = opts.schema;

  // 1. Identify which IDs are already in the TanStack Cache
  // We check the individual entity keys: ['relationship', id]
  const filteredIds = ids.filter((id) => {
    return !queryClient.getQueryData([expandedPath[0], id]);
  });

  const query = useQuery({
    queryKey: [...expandedPath, ids.sort()], // Unique key for this specific list

    enabled: opts.enabled !== false && ids.length > 0,
    
    queryFn: async () => {
      // 2. Only fetch the missing IDs
      if (filteredIds.length === 0) return null;

      const response = await entityFn(filteredIds);
      // Ensure we have raw JSON (handle both Fetch and Axios styles)
      const json = typeof response.json === 'function' ? await response.json() : response.data;
      
      const entities = schema ? filteredArray(schema).parse(json) : json;

      // 3. SIDE-LOAD: Seed the individual cache for each entity
      // This makes individual lookups instant later
      entities.forEach((entity) => {
        queryClient.setQueryData([expandedPath[0], entity.id], entity);
      });

      return entities;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // 4. Build the Map from the Cache (Synchronously)
  const entityMap = ids.reduce((map, id) => {
    const cached = queryClient.getQueryData([expandedPath[0], id]);
    if (cached) map[id] = cached;
    return map;
  }, {});

  return {
    entityMap,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch
  };
}

/*
In a Mastodon-like app, useBatchedEntities is the "Efficiency Engine." 
It solves the two biggest performance problems in social media feeds: 
The Relationship Problem and The N+1 Fetching Problem.

1. The Relationship Problem
When you fetch a timeline, the API gives you a list of Statuses. However, the Statuses don't tell you if 
you (the logged-in user) are following those authors, muting them, or blocking them. That data comes from a separate endpoint: /api/v1/accounts/relationships.

    1. Without Batching: You would have to fire 20 separate API calls (one for each post in the feed) 
       to see if you follow the authors.
    2. With useBatchedEntities: It collects all the unique Account IDs from the feed, waits a millisecond, 
       and fires one single request for all 20 IDs at once.

2. Eliminating Duplicate Requests (The "Only Missing" Logic)
   On a fast-moving timeline, you see the same accounts repeatedly. If @alice posts 5 times in your feed:

    1. Standard logic might try to fetch her relationship status 5 times.
    2. useBatchedEntities checks the cache first. It says: "I already know my relationship with @alice, 
       I'll only ask the server about @bob and @charlie."

3. The "Side-Loading" Data Flow
It acts as a bridge between a List (the timeline) and Individual Entities (the account status).

Step	                     Action	                                   Benefit

1. Collect	 Gathers all IDs appearing on the screen.	          Prevents "waterfall" loading.
2. Filter	   Subtracts IDs already in your local cache.	        Saves bandwidth and battery.
3. Chunk	   Breaks large lists into groups of 40 
             (to avoid URL length limits).	                    Prevents browser/server errors.
4. Seed	Takes the result and "spreads" it across the cache.     Makes clicking a profile instant.


4. Real-World User Experience
Imagine you are scrolling a long thread. You want to see:

    Avatars (from the Status fetch).
    Content (from the Status fetch).
    Follow/Unfollow Buttons (this is where useBatchedEntities shines).

Because of this utility, the "Follow" buttons won't have individual loading spinners. 
They will all "pop" into their correct state (Following or Not Following) at the exact same time 
as the batch request completes.

In a Mastodon app, it is the difference between a choppy, slow UI that hits the rate limit and a fluid, 
professional UI that feels like a native app.
*/

/*
      entities.forEach((entity) => {
        queryClient.setQueryData([expandedPath[0], entity.id], entity);
      });

      Because fetchRelationships returns objects with an id (the Account ID), queryClient will now have individual 
      entries like ['relationship', '123'].
      The Result:
      Any component in your app can now call queryClient.getQueryData(['relationship', accountId]) 
      and get the relationship status synchronously without a new network request.
*/
