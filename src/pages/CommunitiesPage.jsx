import { useState } from "react";
import Layout from "../components/Layout";
import { MapPin, Globe, Map, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "local", label: "Local", icon: MapPin },
  { id: "state", label: "State", icon: Building2 },
  { id: "country", label: "Country", icon: Map },
  { id: "world", label: "World", icon: Globe },
]

const CommunitiesPage = ({ children }) => {
  const [activeTab, setActiveTab] = useState("local")
    
  return (
    <>
      <Layout.Main>
        <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Communities</h1>
            <p className="text-muted-foreground">Explore posts from your local area to the global community</p>
        </div>
        {/* Communities Tabs */}
        <div className="flex gap-1 border-b border-border bg-card p-1 rounded-lg mb-6">
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
}

export default CommunitiesPage;