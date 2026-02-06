useAccount -> useEntity explanation:

This code is a custom bridge that tries to make Redux act like a data-fetching library. 
It manually orchestrates the "Fetch -> Parse -> Dispatch -> Select" lifecycle that modern libraries 
now handle out-of-the-box.

    1. useEntity (The Engine): This is a generic "fetch-and-store" hook. It checks the Redux state via 
      useAppSelector for an entity. If it's missing (or refetch is true), it calls entityFn, 
      parses the result with a Zod schema, and then manually dispatches it into the Redux store 
      via importEntities.
    2. useAccount (The Feature Hook): This is a specialized version of useEntity. 
        It fetches account data but adds Social Logic:
        Relationships: It triggers a second fetch (via useRelationship) to see 
                       if you follow/block this user.
        Privacy/Safety: It calculates isUnavailable (e.g., if you are blocked).
        Auth Enforcement: It automatically redirects to /login if the API returns a 401 error.

==============================================================================================
useTransaction:

In the original Soapbox code,
useTransaction is a powerful tool used for multi-entity updates. It uses immer (produce) to safely 
loop through the store and apply functional changes to existing entities (like toggling a bookmarked or favourited status across several posts).
Do you require this in TanStack?
No, you do not need a central useTransaction hook anymore.
In Redux, you needed this because the data was trapped in one giant object, and you had 
to "reach in" to change it. In TanStack Query, we achieve the same goal using queryClient.setQueriesData.

The TanStack Replacement: "The Patch Pattern"
Instead of a generic transaction function, you create a utility or logic within your mutation to "patch" the cache.
1. How to "Toggle" a property (Like the Transaction did)
If you want to update a property on a post (status) everywhere it appears (Home, Profile, Bookmarks):

// This replaces the "transaction" logic
const patchStatus = (statusId, updater) => {
  // 1. Update the individual status query
  queryClient.setQueryData(['statuses', statusId], (old) => 
    old ? updater(old) : old
  );

  // 2. Update ALL lists/timelines that might contain this status
  // This is the "Transaction" equivalent: searching all queries starting with 'timeline'
  queryClient.setQueriesData({ queryKey: ['timeline'] }, (oldData) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map(page => ({
        ...page,
        items: page.items.map(item => 
          item.id === statusId ? updater(item) : item
        )
      }))
    };
  });
};

2. Why this is better:

    1.Type Safety: The Redux transaction was a bit "blind"—it just looped through keys. In TanStack, your updater 
      function is specific to the data type you are touching.
    2.No Global Lock: Redux transactions update the entire state tree. TanStack updates only the specific query keys 
      you target, which is much better for performance in large social apps.
    3.No immer needed: Since you are returning new objects in setQueryData, TanStack handles the immutability logic 
      for you.

What to do with the existing code?
You can delete useTransaction, entitiesTransaction, and doTransaction once you have migrated your "Action" hooks (like useBookmark, useToggleLike, etc.) to use the queryClient patching method shown above.
Summary of the "Mental Shift"

    Redux Transaction: "I want to change ID 123 inside the STATUSES bucket."
    TanStack Patch: "I want to update the data for any query that includes ['statuses', '123'] or is part of a 
    ['timeline']."

