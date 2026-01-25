import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Layout from '../components/Layout'
import BroadcastCard from "@/components/cards/BroadcastCard"
import {
  Radio,
  Search,
  Eye,
  Clock,
  Video,
  Building2,
  User,
  CheckCircle2,
  MessageCircle,
  Heart,
} from "lucide-react"
import { Link } from "react-router-dom"

const mockBroadcasts = [
  {
    id: 1,
    title: "Building a Real-Time Chat App with Next.js",
    description: "Live coding session: Creating a full-stack chat application with real-time features",
    thumbnail: "/coding-workshop-web-development.jpg",
    broadcaster: "codeWizard",
    broadcasterAvatar: "/developer-avatar.png",
    broadcasterType: "individual",
    viewers: 1247,
    duration: "2:34:15",
    category: "Technology",
    isLive: true,
    startedAt: "2 hours ago",
    likes: 892,
    comments: 234,
  },
  {
    id: 2,
    title: "Product Launch: Revolutionary AI Assistant",
    description: "Join us for the official launch of our new AI-powered productivity assistant",
    thumbnail: "/ai-conference-tech-summit.jpg",
    broadcaster: "TechCorp",
    broadcasterAvatar: "/tech-company-logo.jpg",
    broadcasterType: "institution",
    viewers: 5432,
    duration: "1:15:30",
    category: "Business",
    isLive: true,
    startedAt: "45 minutes ago",
    likes: 3421,
    comments: 876,
  },
  {
    id: 3,
    title: "Live Q&A: Climate Change Solutions",
    description: "Interactive discussion with climate scientists about practical solutions for sustainability",
    thumbnail: "/climate-change-environment-workshop.jpg",
    broadcaster: "MIT_Research",
    broadcasterAvatar: "/mit-logo.png",
    broadcasterType: "institution",
    viewers: 892,
    duration: "0:45:22",
    category: "Science",
    isLive: true,
    startedAt: "30 minutes ago",
    likes: 567,
    comments: 123,
  },
  {
    id: 4,
    title: "Photography Tips: Golden Hour Shooting",
    description: "Live from the field: Capturing stunning golden hour portraits",
    thumbnail: "/photography-workshop-portrait-camera.jpg",
    broadcaster: "photoMaster",
    broadcasterAvatar: "/photographer-avatar.png",
    broadcasterType: "individual",
    viewers: 234,
    duration: "1:02:45",
    category: "Arts",
    isLive: true,
    startedAt: "1 hour ago",
    likes: 445,
    comments: 89,
  },
  {
    id: 5,
    title: "Startup Pitch Competition Finals",
    description: "Watch the top 10 startups pitch to investors for $1M in funding",
    thumbnail: "/startup-pitch-event-business.jpg",
    broadcaster: "StartupAccelerator",
    broadcasterAvatar: "/startup-accelerator-logo.png",
    broadcasterType: "institution",
    viewers: 3456,
    duration: "3:12:08",
    category: "Business",
    isLive: true,
    startedAt: "3 hours ago",
    likes: 2134,
    comments: 567,
  },
  {
    id: 6,
    title: "Game Development: Building a 2D Platformer",
    description: "Live coding: Creating a retro-style platformer game from scratch",
    thumbnail: "/game-development-gaming-hackathon.jpg",
    broadcaster: "GameDevCommunity",
    broadcasterAvatar: "/gaming-community-logo.png",
    broadcasterType: "institution",
    viewers: 678,
    duration: "2:05:33",
    category: "Gaming",
    isLive: true,
    startedAt: "2 hours ago",
    likes: 534,
    comments: 145,
  },
]

const BroadcastingPage = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const navigate = useNavigate()

  const categories = ["all", "Technology", "Business", "Science", "Arts", "Gaming", "Education", "Entertainment"]

  const filteredBroadcasts = mockBroadcasts.filter((broadcast) => {
    const matchesSearch =
      broadcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broadcast.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || broadcast.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Layout.Main>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Radio className="h-8 w-8 text-primary" />
            Live Broadcasting
          </h1>
          <p className="text-muted-foreground">Watch live streams from creators and organizations</p>
        </div>
        <Button onClick={() => navigate("/broadcasting/studio")} className="gap-2">
          <Video className="h-4 w-4" />
          Go Live
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search live broadcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredBroadcasts.map((broadcast) => (
          <BroadcastCard key={broadcast.id} broadcast={broadcast} />
        ))}
      </div>

      {filteredBroadcasts.length === 0 && (
        <div className="text-center py-12">
          <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No live broadcasts found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or check back later</p>
        </div>
      )}
    </Layout.Main>
  )
}

export default BroadcastingPage