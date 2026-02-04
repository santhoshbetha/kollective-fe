import Layout from "../components/Layout";
import { TrendingUp, Sparkles, Star, Hash } from "lucide-react"
import { ContentTabs } from "../components/ContentTabs";
import { useTrendingStatuses } from "../features/trends/hooks/useTrendingStatuses";
import { useTrendingTags } from "../features/trends/hooks/useTrendingTags";

const tabs = [
  {
    id: "trending",
    label: "Trending",
    icon: TrendingUp,
    content: <div className="text-center py-8 text-muted-foreground">Trending content coming soon...</div>
  },
  {
    id: "foryou",
    label: "For You",
    icon: Sparkles,
    content: <div className="text-center py-8 text-muted-foreground">Personalized recommendations coming soon...</div>
  },
  {
    id: "popular",
    label: "Popular",
    icon: Star,
    content: <div className="text-center py-8 text-muted-foreground">Popular posts coming soon...</div>
  },
  {
    id: "hashtags",
    label: "Hashtags",
    icon: Hash,
    content: <div className="text-center py-8 text-muted-foreground">Trending hashtags coming soon...</div>
  },
]

const ExplorePage = () => {
  const statuses = useTrendingStatuses();
  const tags = useTrendingTags();
  return (
    <>
      <Layout.Main>
        <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Explore</h1>
            <p className="text-muted-foreground">Discover new content and trending topics</p>
        </div>
        <ContentTabs tabs={tabs} defaultValue="trending" variant="underline" size="lg" />
      </Layout.Main>
    </>
  );
}

export default ExplorePage;
/*
    <div className="explore-layout">
      {/* Sidebar: Tags *//*}
      <aside>
        {tags.isLoading ? <Skeleton /> : tags.data.map(tag => (
          <TrendingTagCard key={tag.name} tag={tag} />
        ))}
      </aside>

      {/* Main: Statuses *//*}
      <main>
        {statuses.isLoading ? <Spinner /> : statuses.data.map(status => (
          <StatusCard key={status.id} status={status} />
        ))}
      </main>
    </div>
*/