import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Layout from '../components/Layout'
import PollCard from "@/components/cards/PollCard"
import { Plus, Search, BarChart3, Clock, TrendingUp, BadgeCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

const mockPolls = [
  {
    id: 1,
    question: "What's the most important programming skill in 2025?",
    author: "techEnthusiast",
    authorAvatar: "/tech-enthusiast.png",
    authorType: "individual",
    timestamp: "2h ago",
    duration: "2 days left",
    options: [
      { id: 1, text: "AI/ML Integration", votes: 4523, percentage: 45 },
      { id: 2, text: "System Design", votes: 3012, percentage: 30 },
      { id: 3, text: "Cloud Architecture", votes: 1506, percentage: 15 },
      { id: 4, text: "Web3/Blockchain", votes: 1004, percentage: 10 },
    ],
    totalVotes: 10045,
    hasVoted: null,
    category: "Technology",
  },
  {
    id: 2,
    question: "Which renewable energy source should governments prioritize?",
    author: "MIT_Research",
    authorAvatar: "/mit-logo-generic.png",
    authorType: "institution",
    timestamp: "5h ago",
    duration: "5 days left",
    options: [
      { id: 1, text: "Solar Power", votes: 8934, percentage: 42 },
      { id: 2, text: "Wind Energy", votes: 6392, percentage: 30 },
      { id: 3, text: "Nuclear Fusion", votes: 4261, percentage: 20 },
      { id: 4, text: "Hydroelectric", votes: 1704, percentage: 8 },
    ],
    totalVotes: 21291,
    hasVoted: null,
    category: "Science",
  },
  {
    id: 3,
    question: "What's your preferred work arrangement?",
    author: "TechCorp",
    authorAvatar: "/tech-company-logo.jpg",
    authorType: "institution",
    timestamp: "8h ago",
    duration: "3 days left",
    options: [
      { id: 1, text: "Fully Remote", votes: 6723, percentage: 48 },
      { id: 2, text: "Hybrid (3 days office)", votes: 4202, percentage: 30 },
      { id: 3, text: "Hybrid (2 days office)", votes: 2101, percentage: 15 },
      { id: 4, text: "Fully In-Office", votes: 980, percentage: 7 },
    ],
    totalVotes: 14006,
    hasVoted: 1,
    category: "Business",
  },
  {
    id: 4,
    question: "Best JavaScript framework for new projects in 2025?",
    author: "codeWizard",
    authorAvatar: "/developer-avatar.png",
    authorType: "individual",
    timestamp: "12h ago",
    duration: "1 day left",
    options: [
      { id: 1, text: "Next.js", votes: 5634, percentage: 40 },
      { id: 2, text: "Remix", votes: 4225, percentage: 30 },
      { id: 3, text: "SvelteKit", votes: 2817, percentage: 20 },
      { id: 4, text: "Astro", votes: 1409, percentage: 10 },
    ],
    totalVotes: 14085,
    hasVoted: null,
    category: "Development",
  },
  {
    id: 5,
    question: "What's the biggest challenge for startups in 2025?",
    author: "StartupAccelerator",
    authorAvatar: "/startup-accelerator-logo.png",
    authorType: "institution",
    timestamp: "1d ago",
    duration: "6 days left",
    options: [
      { id: 1, text: "Fundraising", votes: 3456, percentage: 35 },
      { id: 2, text: "Talent Acquisition", votes: 2965, percentage: 30 },
      { id: 3, text: "Market Competition", votes: 1976, percentage: 20 },
      { id: 4, text: "Product-Market Fit", votes: 1482, percentage: 15 },
    ],
    totalVotes: 9879,
    hasVoted: null,
    category: "Business",
  },
  {
    id: 6,
    question: "Best time for deep work and coding?",
    author: "productivityGuru",
    authorAvatar: "/professional-man.jpg",
    authorType: "individual",
    timestamp: "1d ago",
    duration: "4 days left",
    options: [
      { id: 1, text: "Early Morning (5-9 AM)", votes: 4123, percentage: 38 },
      { id: 2, text: "Late Night (9 PM-1 AM)", votes: 3291, percentage: 30 },
      { id: 3, text: "Afternoon (1-5 PM)", votes: 2194, percentage: 20 },
      { id: 4, text: "Mid-Morning (9 AM-12 PM)", votes: 1316, percentage: 12 },
    ],
    totalVotes: 10924,
    hasVoted: null,
    category: "Lifestyle",
  },
]

const PollsPage = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredPolls = mockPolls.filter((poll) => {
    const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase())
    if (activeTab === "active") return matchesSearch && poll.duration.includes("left")
    if (activeTab === "ended") return matchesSearch && !poll.duration.includes("left")
    return matchesSearch
  })

  return (
    <Layout.Main>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Polls</h1>
          <p className="text-muted-foreground">Vote and share your opinion with the community</p>
        </div>
        <Link to="/polls/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Poll
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={activeTab === "active" ? "default" : "outline"}
            onClick={() => setActiveTab("active")}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={activeTab === "ended" ? "default" : "outline"}
            onClick={() => setActiveTab("ended")}
            size="sm"
          >
            Ended
          </Button>
        </div>
      </div>

      {/* Polls List */}
      <div className="space-y-4">
        {filteredPolls.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </Layout.Main>
  )
}

export default PollsPage