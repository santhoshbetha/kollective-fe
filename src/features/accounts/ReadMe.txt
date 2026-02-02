expandFollowRequests:
Thinking
No, this is
not required. This entire function is replaced by the fetchNextPage method provided by useInfiniteQuery.
In Redux, you had to manually track the next URL in your state and pass it back into a thunk. In TanStack Query, the pagination logic is "encapsulated." 
The hook remembers the last next link and uses it automatically when you call fetchNextPage.


When you use the useFollowRequests hook we built earlier, you simply call it like this in your component:

const FollowRequestsList = () => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useFollowRequests();

  return (
    <div>
      {data?.pages.map(page => 
        page.accounts.map(account => <AccountCard key={account.id} account={account} />)
      )}

      {/* This replaces the 'expandFollowRequests' thunk entirely */}
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};
