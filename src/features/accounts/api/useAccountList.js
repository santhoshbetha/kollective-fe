import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { extractMaxIdFromLink } from '@/utils/apiUtils';
import { useStatusImporter } from '../hooks/useStatusImporter';

export const useAccountList = (accountId, type = 'followers') => {
  const { importAccounts } = useStatusImporter();

  return useInfiniteQuery({
    // Cache key is unique to the user AND the list type
    queryKey: ['accounts', accountId, type],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/api/v1/accounts/${accountId}/${type}`, {
        params: { max_id: pageParam, limit: 40 }
      });

      // SIDE-LOADING: Seed the global account cache
      // This makes clicking any profile in the list instant
      importAccounts(response.data);

      return {
        accounts: response.data,
        nextMaxId: extractMaxIdFromLink(response.headers.get('Link')),
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextMaxId ?? undefined,
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/*
const AccountList = ({ accountId, type }) => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    isLoading 
  } = useAccountList(accountId, type);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="account-list">
      {data?.pages.map((page) => 
        page.accounts.map((account) => (
          <AccountCard key={account.id} account={account}>
            {/* The FollowButton here will use the optimistic logic we built earlier *//*}
            <FollowButton accountId={account.id} />
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

*/

/*
// /Thinking
To implement
Infinite Scrolling without a "Load More" button, you combine TanStack Query with the React Intersection Observer.
//Place this in your generic AccountList or StatusList component.
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAccountList } from '../api/useAccountList';

const InfiniteAccountList = ({ accountId, type }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,    // Trigger when 10% of the sentinel is visible
    rootMargin: '400px' // Start fetching 400px before the user hits the bottom
  });

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    isLoading 
  } = useAccountList(accountId, type);

  // 1. Logic: When the sentinel enters the view, fetch the next page
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="list-container">
      {data?.pages.map((page) => 
        page.accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))
      )}

      {/* 2. THE SENTINEL: An invisible element we "watch" *//*}
      <div ref={ref} style={{ height: '20px', background: 'transparent' }}>
        {isFetchingNextPage && <SmallSpinner />}
      </div>
      
      {!hasNextPage && <p className="end-msg">No more accounts to show</p>}
    </div>
  );
};

*/

/*
//Thinking
To implement
Pull to Refresh with TanStack Query, you leverage the refetch function. Unlike Redux, where you’d have to manually clear an array and reset a page counter, TanStack Query handles the "reset" of the infinite stream for you.
For the best UX on mobile-web (like Mastodon/Twitter), use the react-simple-pull-to-refresh library.

Wrap your InfiniteAccountList in the PullToRefresh component.

import PullToRefresh from 'react-simple-pull-to-refresh';
import { useAccountList } from '../api/useAccountList';

const AccountListWithRefresh = ({ accountId, type }) => {
  const { 
    data, 
    refetch,      // <--- Use this for Pull to Refresh
    isLoading,
    isRefetching  // <--- Use this for UI indicators
  } = useAccountList(accountId, type);

  // 1. The Refresh Handler
  // TanStack's refetch() returns a promise that resolves when the data is fresh
  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading && !isRefetching) return <LoadingSpinner />;

  return (
    <PullToRefresh onRefresh={handleRefresh} pullingContent="">
      <div className="list-container">
        {/* If refetching in background, you can show a subtle top-bar spinner *//*}
        {isRefetching && <TopProgressBar />}
        
        {data?.pages.map((page) => 
          page.accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))
        )}
        
        {/* Your Intersection Observer Sentinel from the previous step *//*}
        <div ref={sentinelRef} />
      </div>
    </PullToRefresh>
  );
};

*/

