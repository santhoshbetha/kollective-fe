import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import { ArrowUp, ArrowDown, Share2, Bookmark, Flag, ThumbsUp, MessageCircle, Send, Eye, ArrowLeft } from "lucide-react"
import { cn } from "../lib/utils"

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
    description: "In this comprehensive tutorial, we'll build a full-stack application using Next.js 14 with the App Router, TypeScript, and Tailwind CSS. We'll cover server components, client components, routing, data fetching, and deployment to Vercel. Perfect for developers who want to learn modern Next.js development practices.",
    followers: "125K",
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
    description: "Join us as we unveil our groundbreaking AI assistant that revolutionizes productivity. Learn about the cutting-edge features, real-world applications, and how it's transforming industries across the globe.",
    followers: "500K",
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
    description: "Get an authentic look at a typical day in the life of a software engineer. From morning standups to debugging sessions, see what it's really like working in tech.",
    followers: "89K",
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
    description: "MIT researchers explain their latest breakthrough in climate science. Understand the implications for our planet and what this means for future environmental policies.",
    followers: "1.2M",
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
    description: "A comprehensive comparison between React and Vue.js. We'll examine performance, learning curves, ecosystem, and help you decide which framework is right for your next project.",
    followers: "234K",
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
    description: "Detailed analysis of the latest SpaceX Starship test flight. We break down what went right, what went wrong, and what it means for the future of space exploration.",
    followers: "2.5M",
  },
]

const mockComments = [
  {
    id: 1,
    author: "techFan123",
    authorAvatar: "/abstract-geometric-shapes.png",
    content: "This is exactly what I needed! Thanks for the detailed explanation.",
    timestamp: "2 hours ago",
    likes: 45,
  },
  {
    id: 2,
    author: "developerPro",
    authorAvatar: "/developer-working.png",
    content: "Great tutorial! Could you do one on TypeScript next?",
    timestamp: "4 hours ago",
    likes: 23,
  },
  {
    id: 3,
    author: "codingNewbie",
    authorAvatar: "/diverse-students-studying.png",
    content: "I'm a beginner and this helped me understand the concepts much better. Subscribed!",
    timestamp: "6 hours ago",
    likes: 67,
  },
]

export default function VideoDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [votes, setVotes] = useState(3421)
  const [hasVoted, setHasVoted] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [comment, setComment] = useState("")

  const video = mockVideos.find((v) => v.id === parseInt(id || "0"))

  const handleVote = (type) => {
    if (hasVoted === type) {
      setVotes(votes + (type === "up" ? -1 : 1))
      setHasVoted(null)
    } else if (hasVoted) {
      setVotes(votes + (type === "up" ? 2 : -2))
      setHasVoted(type)
    } else {
      setVotes(votes + (type === "up" ? 1 : -1))
      setHasVoted(type)
    }
  }

  if (!video) {
    return (
      <Layout.Main>
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Video not found</h3>
          <p className="text-muted-foreground">The video you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/videos")} className="mt-4">
            Back to Videos
          </Button>
        </div>
      </Layout.Main>
    )
  }

  return (
    <Layout.Main>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/videos")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Videos
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Video Player */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="aspect-video bg-black">
            <video
              src="/placeholder-video.mp4"
              poster={video.thumbnail}
              controls
              className="w-full h-full"
            />
          </div>

          <div className="p-6 space-y-6">
            {/* Video Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <Badge variant="secondary">{video.category}</Badge>
                <h1 className="text-2xl font-bold text-balance">{video.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{video.views} views</span>
                  </div>
                  <span>•</span>
                  <span>{video.timestamp}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("rounded-none border-r", hasVoted === "up" && "text-primary bg-primary/10")}
                    onClick={() => handleVote("up")}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    {votes > 999 ? `${(votes / 1000).toFixed(1)}k` : votes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("rounded-none", hasVoted === "down" && "text-destructive bg-destructive/10")}
                    onClick={() => handleVote("down")}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={cn("gap-2", isSaved && "text-primary border-primary")}
                  onClick={() => setIsSaved(!isSaved)}
                >
                  <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                </Button>

                <Button variant="outline" size="sm">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Author Info */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={video.authorAvatar} alt={video.author} />
                    <AvatarFallback>{video.author[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{video.author}</p>
                    <p className="text-sm text-muted-foreground">{video.followers} followers</p>
                  </div>
                </div>
                <Button variant={isFollowing ? "outline" : "default"} onClick={() => setIsFollowing(!isFollowing)}>
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm leading-relaxed">{video.description}</p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-6 space-y-6">
              <h2 className="text-xl font-semibold">{mockComments.length} Comments</h2>

              <div className="space-y-4">
                {/* Comment Input */}
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src="/abstract-geometric-shapes.png" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setComment("")}>
                        Cancel
                      </Button>
                      <Button size="sm" disabled={!comment.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {mockComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} />
                        <AvatarFallback>{comment.author[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 gap-2">
                            <ThumbsUp className="h-3 w-3" />
                            <span className="text-xs">{comment.likes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 gap-2">
                            <MessageCircle className="h-3 w-3" />
                            <span className="text-xs">Reply</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout.Main>
  )
}