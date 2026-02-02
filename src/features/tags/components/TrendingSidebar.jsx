// src/features/tags/components/TrendingSidebar.jsx
import { useTrendingTags } from '../api/useTags';
import { useToggleTagFollow } from '../api/useTagActions';

const TrendingSidebar = () => {
  const { data: trends, isLoading } = useTrendingTags();

  if (isLoading) return <div className="sidebar-skeleton" />;

  return (
    <section className="trending-sidebar">
      <h3>Trending Hashtags</h3>
      {trends?.map(tag => (
        <TrendingItem key={tag.name} tag={tag} />
      ))}
    </section>
  );
};

const TrendingItem = ({ tag }) => {
  const { mutate: toggleFollow } = useToggleTagFollow(tag.name);

  return (
    <div className="trend-row">
      <Link href={`/tags/${tag.name}`}>
        <span className="tag-name">#{tag.name}</span>
        <small>{tag.history[0].accounts} people talking</small>
      </Link>
      <button onClick={() => toggleFollow(tag.following)}>
        {tag.following ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
};
