import { useMutedAccounts } from "../api/useMutedAccounts";

const MutesList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMutedAccounts();

  return (
    <div className="scrollable-list">
      {data?.pages.map(page => 
        page.items.map(account => (
          <AccountCard key={account.id} account={account}>
            <UnmuteButton accountId={account.id} />
          </AccountCard>
        ))
      )}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default MutesList;
