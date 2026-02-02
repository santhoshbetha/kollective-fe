PullToRefresh
--------------------
1. The Logic
You can use the refetch function provided by the useInfiniteQuery hook. 

const { 
  data, 
  refetch, 
  isRefetching 
} = useStatuses('home');

const handleRefresh = async () => {
  // This tells TanStack Query to throw away the current cache 
  // and get fresh data from the server.
  await refetch();
};

=================================================
2. Integration with a UI Library
For a social app like Kollective-FE, you typically use a library like 
react-simple-pull-to-refresh or a native mobile-web gesture handler.

import PullToRefresh from 'react-simple-pull-to-refresh';

const Timeline = () => {
  const { data, refetch, isLoading } = useStatuses('home');

  if (isLoading) return <Spinner />;

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="status-list">
        {data.pages.map((page) => 
          page.items.map(status => <StatusCard key={status.id} status={status} />)
        )}
      </div>
    </PullToRefresh>
  );
};

============================================================
3. Advanced: The "Mastodon Style" Refresh
If you want to keep the current posts and just prepend new ones at the top
(like the "New Tweets Available" bar), you don't use refetch(). Instead, you fetch the newest posts using since_id. 

const fetchNewPosts = async () => {
  const newestId = data.pages[0].items[0].id;
  const response = await api.get('/api/v1/timelines/home', {
    params: { since_id: newestId }
  });
  
  // Prepend new posts to the TanStack Cache
  queryClient.setQueryData(['statuses', 'home'], (old) => ({
    ...old,
    pages: [
      { ...old.pages[0], items: [...response.data, ...old.pages[0].items] },
      ...old.pages.slice(1)
    ]
  }));
};

=============================================================
Why this beats Redux "Pull to Refresh":

    Automatic Loading States: You can use the isRefetching flag 
    to show a CSS spinner at the top of the list without writing any new Reducers.
    Request Cancellation: If a user pulls to refresh, then navigates away immediately, TanStack Query automatically cancels the network request to save data/bandwidth.
    Background Sync: You can combine this with refetchOnWindowFocus: true so the "refresh" happens automatically whenever the user returns to the tab.

===========================================================================