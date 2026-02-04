// src/features/trends/api/useTrendingStatuses.js
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '@/features/statuses/hooks/useStatusImporter';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInstance } from '@/features/instance/hooks/useInstance';
import { extractNextUrl } from '@/utils/apiUtils';
import { useTrendPreferenceStore } from '../store/useTrendPreferenceStore';

export const useTrendingStatuses = (limit = 10) => {
  const { importStatusEntities } = useStatusImporter();

  return useQuery({
    queryKey: ['trends', 'statuses', { limit }],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/trends/statuses', {
        params: { limit }
      });

      // SIDE-LOADING: Seed the status cache for instant rendering elsewhere
      importStatusEntities(data);

      return data; // Returns Array of Status objects
    },
    staleTime: 1000 * 60 * 15, // Trends recalculate periodically
  });
};

/*
const ExplorePage = () => {
  const { data: tags, isLoading: loadingTags } = useTrendingTags();
  const { data: posts, isLoading: loadingPosts } = useTrendingStatuses();

  return (
    <div className="explore-grid">
      <section className="trends-sidebar">
        <h3>Trending Hashtags</h3>
        {loadingTags ? <Skeleton /> : tags.map(tag => <TagLink key={tag.name} tag={tag} />)}
      </section>

      <section className="trends-feed">
        <h3>Trending Posts</h3>
        {loadingPosts ? <Spinner /> : posts.map(status => <StatusCard key={status.id} status={status} />)}
      </section>
    </div>
  );
};

*/

//====================================================================================================
// src/features/trends/api/useTrendingStatuses.js
export const useTrendingStatuses2 = () => {
  const { importStatusEntities } = useStatusImporter();

  return useQuery({
    queryKey: ['trends', 'statuses'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/trends/statuses');

      // Side-load into global status cache
      importStatusEntities(data); // Side-load into global status cache

      return data;
    },
    staleTime: 1000 * 60 * 15, // Trends update every 15 mins
  });
};

//========================================================================================================
//In TanStack Query, you replace these thunks with a single useInfiniteQuery. 
// You can delete the TRENDING_STATUSES_FETCH and EXPAND actions, as the library 
// handles pagination via the next link and the server-supported features check automatically.

//1. The Migration Hook
//Create src/features/trends/api/useTrendingStatuses.js. 
// This hook handles the initial fetch and the "Load More" logic using the Link header.
export const useTrendingStatuses3 = () => {
  const { importStatusEntities } = useStatusImporter();
  const { data: instance } = useInstance();

  // Replaces the getFeatures(instance).trendingStatuses check
  const isEnabled = !!instance?.configuration?.trends?.enabled;

  return useInfiniteQuery({
    queryKey: ['statuses', 'trends'],
    queryFn: async ({ pageParam }) => {
      // Replaces fetchTrendingStatuses & expandTrendingStatuses
      const url = pageParam || '/api/v1/trends/statuses';
      const response = await api.get(url);
      const data = response.data;

      // SIDE-LOADING: Seed the global status/account cache
      // Replaces dispatch(importFetchedStatuses(statuses))
      importStatusEntities(data);

      return {
        items: data,
        nextPage: response.headers.get('Link') ? extractNextUrl(response.headers.get('Link')) : null,
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    enabled: isEnabled,
    staleTime: 1000 * 60 * 30, // Trends change slowly, cache for 30m
  });
};
/*
const TrendingTimeline = () => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useTrendingStatuses3();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="trending-feed">
      {data?.pages.map((page) => 
        page.items.map((status) => (
          <StatusCard key={status.id} status={status} />
        ))
      )}

      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Show More Trends'}
        </button>
      )}
    </div>
  );
};

*/
//==================================================================================
// /"Trend Categories"
// src/features/trends/api/useTrendingStatuses.js
export const useCategorizedTrends = (category = 'all') => {
  return useInfiniteQuery({
    queryKey: ['statuses', 'trends'],
    queryFn: api.get('/api/v1/personaltrends/tags').then(res => res.data),//fetchTrendingStatuses,
    select: (data) => {
      if (category === 'all') return data;

      return {
        ...data,
        pages: data.pages.map(page => ({
          ...page,
          // Filter items based on your category logic 
          // (e.g., checking for specific hashtags or content keywords)
          items: page.items.filter(status => 
            category === 'news' ? status.tags.some(t => t.name === 'news') : true
          )
        }))
      };
    },
    staleTime: 1000 * 60 * 15,
  });
};
/*
const TrendsDashboard = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { data, isLoading } = useCategorizedTrends(activeCategory);

  return (
    <div>
      <div className="tab-bar">
        <button onClick={() => setActiveCategory('all')}>All Trends</button>
        <button onClick={() => setActiveCategory('news')}>News Only</button>
      </div>

      <div className="trends-list">
        {isLoading ? <Skeleton /> : (
          data.pages.map(page => 
            page.items.map(status => <StatusCard key={status.id} status={status} />)
          )
        )}
      </div>
    </div>
  );
};

*/
//==================================================================================
//Trend Personalization

// src/features/trends/api/useTrendingStatuses.js


export const usePersonalizedTrends = () => {
  const hiddenCategories = useTrendPreferenceStore((s) => s.hiddenCategories);

  return useInfiniteQuery({
    queryKey: ['statuses', 'trends'],
    queryFn: api.get('/api/v1/personaltrends/tags').then(res => res.data),//fetchTrendingStatuses,
    select: (data) => ({
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        items: page.items.filter(status => {
          // Logic: Hide if status matches any user-hidden category
          const statusTags = status.tags.map(t => t.name.toLowerCase());
          return !hiddenCategories.some(hidden => statusTags.includes(hidden));
        })
      }))
    })
  });
};
//==================================================================================


