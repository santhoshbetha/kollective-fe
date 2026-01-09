
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { TrendingUp, FileText, Megaphone } from "lucide-react"
import { cn } from "@/lib/utils"
import Layout from '../components/Layout';

const tabs = [
  { id: "follows", label: "Follows", icon: FileText },
  { id: "trending", label: "Trending Posts", icon: TrendingUp },
  { id: "voices", label: "Trending Voices", icon: Megaphone },
]

const HomePage = ({ children }) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState("follows");

  return (
    <>
    <Layout.Main>
    <div className="flex gap-1 border-b border-border bg-card p-1 rounded-lg lg:mt-2">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </div>
    </Layout.Main>
    </>
  );
};

export default HomePage;

/*
 <LinkFooter />
*/
