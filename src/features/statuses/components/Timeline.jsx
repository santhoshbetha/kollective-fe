import { useHomeTimeline } from '../api/useHomeTimeline';

export const Timeline = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useHomeTimeline();

  return (
    <div className="feed">
      {data?.pages.map((page) => 
        page.map((status) => <StatusItem key={status.id} statusId={status.id} />)
      )}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Show More'}
        </button>
      )}
    </div>
  );
};

