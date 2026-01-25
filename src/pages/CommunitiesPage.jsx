import Layout from "../components/Layout";
import { MapPin, Globe, Map, Building2 } from "lucide-react"
import { ContentTabs } from "../components/ContentTabs";

const tabs = [
  {
    id: "local",
    label: "Local",
    icon: MapPin,
    content: <div className="text-center py-8 text-muted-foreground">Local communities coming soon...</div>
  },
  {
    id: "state",
    label: "State",
    icon: Building2,
    content: <div className="text-center py-8 text-muted-foreground">State communities coming soon...</div>
  },
  {
    id: "country",
    label: "Country",
    icon: Map,
    content: <div className="text-center py-8 text-muted-foreground">Country communities coming soon...</div>
  },
  {
    id: "world",
    label: "World",
    icon: Globe,
    content: <div className="text-center py-8 text-muted-foreground">World communities coming soon...</div>
  },
]

const CommunitiesPage = () => {
  return (
    <>
      <Layout.Main>
        <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Communities</h1>
            <p className="text-muted-foreground">Explore posts from your local area to the global community</p>
        </div>
        <ContentTabs tabs={tabs} defaultValue="local" variant="default" size="lg" />
      </Layout.Main>
    </>
  );
}

export default CommunitiesPage;