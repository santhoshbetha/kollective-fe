import { useRelationship } from './hooks/useRelationship';

////simple useRelationship(accountId) hook (singular) that pulls this data for a single Follow button

// How to use it in your UI
// Now, your Follow Button component is extremely simple. It doesn't care about the batching logic;
// it just asks for the relationship.

export const FollowButton2 = ({ accountId }) => {
  // listKey defaults to 'home', or pass the specific list this button is in
  const { data: rel, isLoading } = useRelationship(accountId);

  if (isLoading) return <div className="w-20 h-8 bg-gray-100 animate-pulse rounded-full" />;

  const isFollowing = rel?.following;

  return (
    <button className={`px-4 py-1 rounded-full font-bold text-sm transition-colors
      ${isFollowing 
        ? 'bg-white border border-gray-300 text-black hover:border-red-200 hover:text-red-600' 
        : 'bg-black text-white hover:bg-gray-800'}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton2;

/*
Why this is highly efficient:

    1. Zero Network Requests: When your timeline loads, useBatchedEntities fetches 40 relationships and seeds 
       the cache. When the 40 FollowButton components mount, they call useRelationship, 
       find the data in the cache via initialData, and render instantly with zero extra network calls.
    2. Synced State: If you follow the user in one place, every useRelationship hook for that accountId across 
       your app will update automatically because they share the same Query Key.
    3. Standalone Support: If you navigate directly to a profile page (where no batching happened), 
       the queryFn will trigger a single request for just that one relationship.

Critical Detail: In useBatchedEntities, ensure your expandedPath matches ['relationship', listKey].
*/