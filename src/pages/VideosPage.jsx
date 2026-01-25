import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Layout from '../components/Layout'
import VideoCard from "@/components/cards/VideoCard"
import { ArrowUp, ArrowDown, MessageCircle, Share2, Bookmark, Search, Upload, BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"

const mockVideos = [
  {
    id: 1,
    title: "Building a Full-Stack App with Next.js 14",
    author: "codeWithJohn",
    authorAvatar: "/developer-working.png",
    authorType: "individual",
    thumbnail: "/coding-tutorial.png",
    duration: "24:15",
    votes: 3421,
    views: "45K",
    comments: 234,
    timestamp: "2 days ago",
    category: "Education",
    hasVoted: "up",
  },
  {
    id: 2,
    title: "Product Launch: Revolutionary AI Assistant",
    author: "TechCorp",
    authorAvatar: "/tech-company-logo.jpg",
    authorType: "institution",
    thumbnail: "/ai-technology.png",
    duration: "15:42",
    votes: 8934,
    views: "120K",
    comments: 892,
    timestamp: "1 day ago",
    category: "Technology",
    hasVoted: null,
  },
  {
    id: 3,
    title: "Day in the Life of a Software Engineer",
    author: "techVlogger",
    authorAvatar: "/tech-vlogger.jpg",
    authorType: "individual",
    thumbnail: "/modern-office-workspace.png",
    duration: "18:30",
    votes: 2156,
    views: "67K",
    comments: 445,
    timestamp: "3 days ago",
    category: "Lifestyle",
    hasVoted: null,
  },
  {
    id: 4,
    title: "Climate Research Breakthrough Explained",
    author: "MIT_Research",
    authorAvatar: "/generic-university-logo.png",
    authorType: "institution",
    thumbnail: "/climate-research-lab.jpg",
    duration: "32:18",
    votes: 5678,
    views: "89K",
    comments: 1234,
    timestamp: "4 days ago",
    category: "Science",
    hasVoted: "up",
  },
  {
    id: 5,
    title: "React vs Vue: Which Framework Should You Learn?",
    author: "webDevMastery",
    authorAvatar: "/web-developer.png",
    authorType: "individual",
    thumbnail: "/web-development-frameworks.jpg",
    duration: "21:45",
    votes: 4521,
    views: "103K",
    comments: 678,
    timestamp: "5 days ago",
    category: "Education",
    hasVoted: null,
  },
  {
    id: 6,
    title: "SpaceX Starship Test Flight Analysis",
    author: "SpaceX",
    authorAvatar: "/spacex-logo.jpg",
    authorType: "institution",
    thumbnail: "/rocket-launch.jpg",
    duration: "45:20",
    votes: 12453,
    views: "2.1M",
    comments: 3456,
    timestamp: "1 week ago",
    category: "Science",
    hasVoted: "up",
  },
]

const VideosPage = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const navigate = useNavigate()

  const categories = ["All", "Education", "Technology", "Science", "Lifestyle", "Entertainment"]

  return (
    <Layout.Main>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Videos</h1>
          <p className="text-muted-foreground mt-1">Discover and share amazing video content</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/videos/upload")}>
          <Upload className="h-4 w-4" />
          Upload Video
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {mockVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </Layout.Main>
  )
}

export default VideosPage