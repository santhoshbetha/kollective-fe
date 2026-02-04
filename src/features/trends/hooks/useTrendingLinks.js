import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useTrendingLinks = (limit = 10) => {
  return useQuery({
    queryKey: ['trends', 'links', { limit }],
    queryFn: async () => {
      // API returns an array of Card objects with 'history' stats
      const { data } = await api.get('/api/v1/trends/links', {
        params: { limit }
      });
      return data;
    },
    // News trends change moderately; cache for 20 minutes
    staleTime: 1000 * 60 * 20,
  });
};

/*
const TrendingLinks = () => {
  const { data: links, isLoading } = useTrendingLinks();

  if (isLoading) return <Skeleton count={5} />;
  if (!links?.length) return null;

  return (
    <div className="trending-links">
      <h3>Popular in News</h3>
      {links.map((link) => (
        <a key={link.url} href={link.url} className="link-card">
          <img src={link.image} alt={link.title} />
          <div>
            <h4>{link.title}</h4>
            <p>{link.provider_name} • {link.history[0].uses} shares</p>
          </div>
        </a>
      ))}
    </div>
  );
};

*/
//================================================================================

export const useTrendingLinks2 = (limit = 10) => {
  return useQuery({
    queryKey: ['trends', 'links', { limit }],
    queryFn: async () => {
      // API returns an array of "Card" entities with history stats
      const { data } = await api.get('/api/v1/trends/links', {
        params: { limit }
      });
      return data;
    },
    // Trends don't fluctuate by the second; cache for 20 minutes
    staleTime: 1000 * 60 * 20, 
  });
};
/*
const TrendingLinks = () => {
  const { data: links, isLoading } = useTrendingLinks();

  if (isLoading) return <div className="skeleton-loader" />;
  if (!links?.length) return null;

  return (
    <div className="trending-news">
      <h3>Popular News</h3>
      {links.map((link) => (
        <a key={link.url} href={link.url} target="_blank" className="link-card">
          <img src={link.image} alt={link.title} className="link-preview" />
          <div className="link-info">
            <span className="provider">{link.provider_name}</span>
            <h4>{link.title}</h4>
            <span className="stats">{link.history[0].uses} shares today</span>
          </div>
        </a>
      ))}
    </div>
  );
};

*/
/*
 Why this finalizes your Redux-to-TanStack Migration:

    Parallel Fetching: You can now place TrendingTags, TrendingStatuses, and TrendingLinks on the same page. TanStack Query will fire all three requests simultaneously, whereas a single Redux thunk often forced them into a sequence.
    Decoupled Refreshing: If a user clicks a "Refresh" button on just the Links section, only that query is invalidated, leaving the other trends untouched.
    No Slice Necessary: You have replaced what would have been a trendsSlice.js with three simple, declarative hooks.

Final Architecture Result
*/
/*
Tags	useTrendingTags	select for total usage count
Posts	useTrendingStatuses	Uses importStatusEntities for cache sync
Links	useTrendingLinks	Background revalidation via staleTime
*/
//================================================================================

