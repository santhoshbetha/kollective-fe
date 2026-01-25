
import { TrendingUp, FileText, Megaphone } from "lucide-react"
import Layout from '../components/Layout';
import { ContentTabs } from '../components/ContentTabs';
import { VoiceSpinner } from '../components/ui/VoiceSpinner';

const tabs = [
  {
    id: "follows",
    label: "Follows",
    icon: FileText,
    content: <div className="text-center py-8 text-muted-foreground">Follows content coming soon...</div>
  },
  {
    id: "trending",
    label: "Trending Posts",
    icon: TrendingUp,
    content: <div className="text-center py-8 text-muted-foreground">Trending posts coming soon...</div>
  },
  {
    id: "voices",
    label: "Trending Voices",
    icon: Megaphone,
    content: <div className="text-center py-8 text-muted-foreground">Trending voices coming soon...</div>
  },
]

const HomePage = () => {
  return (
    <>
    <Layout.Main>
      <ContentTabs tabs={tabs} defaultValue="follows" variant="default" size="lg" />
    </Layout.Main>
    </>
  );
};

export default HomePage;

/*
 <LinkFooter />
*/
