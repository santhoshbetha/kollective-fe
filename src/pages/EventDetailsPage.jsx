import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Video,
  Building2,
  User,
  Heart,
  Share2,
  CheckCircle2,
  MoreHorizontal,
  Paperclip,
  Smile,
  BarChart3,
  LinkIcon,
  CalendarDays,
  MapPinned,
  ImageIcon,
  MessageCircle,
  Repeat2,
  ArrowLeft,
} from "lucide-react"

const mockComments = [
  {
    id: 1,
    author: "techEnthusiast",
    authorAvatar: "/tech-enthusiast.png",
    authorType: "individual",
    content: "This looks amazing! Can't wait to attend. Will there be networking sessions?",
    timestamp: "2h ago",
    replies: 2,
    reposts: 0,
    likes: 5,
    isLiked: false,
  },
  {
    id: 2,
    author: "TechCorp",
    authorAvatar: "/tech-company-logo.jpg",
    authorType: "institution",
    content:
      "Yes! We'll have dedicated networking sessions during lunch and after the main talks. Looking forward to seeing you there!",
    timestamp: "1h ago",
    replies: 0,
    reposts: 1,
    likes: 8,
    isLiked: false,
    replyTo: "@techEnthusiast",
  },
  {
    id: 3,
    author: "aiResearcher",
    authorAvatar: "/developer-avatar.png",
    authorType: "individual",
    content: "Will the sessions be recorded? I might not be able to make it in person but would love to watch later.",
    timestamp: "45m ago",
    replies: 1,
    reposts: 0,
    likes: 3,
    isLiked: true,
  },
]

const mockEvents = [
  {
    id: 1,
    title: "AI & Machine Learning Summit 2025",
    description:
      "Join industry leaders and researchers for a deep dive into the latest advancements in AI and machine learning. Network with professionals and explore cutting-edge technologies. This summit brings together the brightest minds in artificial intelligence to discuss breakthrough innovations, ethical considerations, and the future of AI in various industries.",
    image: "/ai-conference-tech-summit.jpg",
    date: "2025-01-15",
    time: "9:00 AM - 5:00 PM",
    location: "San Francisco Convention Center",
    type: "in-person",
    category: "Technology",
    organizer: "TechCorp",
    organizerAvatar: "/tech-company-logo.jpg",
    organizerType: "institution",
    attendees: 1247,
    interested: 3891,
    isInterested: false,
    tags: ["AI", "Machine Learning", "Technology", "Innovation"],
    agenda: [
      { time: "9:00 AM", title: "Registration & Welcome Coffee" },
      { time: "10:00 AM", title: "Opening Keynote: The Future of AI" },
      { time: "11:30 AM", title: "Panel: Ethical AI Development" },
      { time: "1:00 PM", title: "Networking Lunch" },
      { time: "2:30 PM", title: "Workshop: Building ML Models" },
      { time: "4:00 PM", title: "Closing Remarks & Networking" },
    ],
  },
  {
    id: 2,
    title: "Web Development Bootcamp: React & Next.js",
    description:
      "A comprehensive 3-hour workshop covering modern web development with React and Next.js. Perfect for intermediate developers looking to level up their skills. Learn best practices, modern patterns, and build real-world applications.",
    image: "/coding-workshop-web-development.jpg",
    date: "2025-01-18",
    time: "2:00 PM - 5:00 PM",
    location: "Online via Zoom",
    type: "online",
    category: "Education",
    organizer: "codeWizard",
    organizerAvatar: "/developer-avatar.png",
    organizerType: "individual",
    attendees: 456,
    interested: 892,
    isInterested: true,
    tags: ["React", "Next.js", "Web Development", "JavaScript"],
    agenda: [
      { time: "2:00 PM", title: "Introduction to Modern React" },
      { time: "2:45 PM", title: "Next.js Fundamentals" },
      { time: "3:30 PM", title: "Building a Full-Stack App" },
      { time: "4:15 PM", title: "Q&A and Best Practices" },
    ],
  },
  {
    id: 3,
    title: "Startup Pitch Night: Connect with Investors",
    description:
      "Early-stage startups present their ideas to a panel of venture capitalists and angel investors. Great networking opportunity for entrepreneurs and investors alike. Discover innovative solutions and potentially find your next big investment.",
    image: "/startup-pitch-event-business.jpg",
    date: "2025-01-20",
    time: "6:00 PM - 9:00 PM",
    location: "Innovation Hub, New York",
    type: "in-person",
    category: "Business",
    organizer: "StartupAccelerator",
    organizerAvatar: "/startup-accelerator-logo.png",
    organizerType: "institution",
    attendees: 234,
    interested: 567,
    isInterested: false,
    tags: ["Startups", "Investing", "Entrepreneurship", "Pitch"],
    agenda: [
      { time: "6:00 PM", title: "Registration & Networking" },
      { time: "6:30 PM", title: "Opening Remarks" },
      { time: "7:00 PM", title: "Startup Pitches (Round 1)" },
      { time: "8:00 PM", title: "Networking Break" },
      { time: "8:30 PM", title: "Startup Pitches (Round 2)" },
    ],
  },
]

export default function EventDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isInterested, setIsInterested] = useState(false)
  const [isAttending, setIsAttending] = useState(false)
  const [comment, setComment] = useState("")
    const [comments, setComments] = useState(mockComments)
  const [showAllComments, setShowAllComments] = useState(false)
  const [activeTab, setActiveTab] = useState("discussion")

  const event = mockEvents.find((e) => e.id === parseInt(id || "0"))

  useEffect(() => {
    if (event) {
      setIsInterested(event.isInterested)
    }
  }, [event])

  if (!event) {
    return (
      <Layout.Main>
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Event not found</h3>
          <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/events")} className="mt-4">
            Back to Events
          </Button>
        </div>
      </Layout.Main>
    )
  }

  const handleInterested = () => {
    setIsInterested(!isInterested)
    // Update event interested count
  }

  const handleAttend = () => {
    setIsAttending(!isAttending)
    // Update event attendees count
  }

  const handleComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: comments.length + 1,
        author: "You",
        authorAvatar: "/placeholder.svg",
        authorType: "individual",
        content: comment,
        timestamp: "Just now",
        replies: 0,
        reposts: 0,
        likes: 0,
        isLiked: false,
      }
      setComments([newComment, ...comments])
      setComment("")
    }
  }

  const handleLikeComment = (commentId) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    )
  }

  const displayedComments = showAllComments ? comments : comments.slice(0, 3)

  return (
    <Layout.Main>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/events")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Event Header */}
            <div className="rounded-lg border bg-card overflow-hidden">
              {/* Event Header Image */}
              <div className="relative h-64 md:h-80">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Event Info */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                    <div className="flex items-center gap-2 hover:opacity-80 transition-opacity mb-4">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={event.organizerAvatar || "/placeholder.svg"}
                          alt={event.organizer}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">Organized by</span>
                        {event.organizerType === "individual" ? (
                          <User className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className="font-medium">{event.organizer}</span>
                        {event.organizerType === "institution" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                    {isAttending && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Attending
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {event.type === "online" ? (
                      <Video className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {event.attendees} people going · {event.interested} interested
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mb-6">
                  <Button variant={isAttending ? "default" : "outline"} onClick={handleAttend} className="flex-1 gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {isAttending ? "Attending" : "Attend"}
                  </Button>
                  <Button
                    variant={isInterested ? "default" : "outline"}
                    onClick={handleInterested}
                    className="flex-1 gap-2"
                  >
                    <Heart className={`h-4 w-4 ${isInterested ? "fill-current" : ""}`} />
                    {isInterested ? "Interested" : "Interested?"}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer Info */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Organizer</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {event.organizerType === "institution" ? (
                    <Building2 className="h-6 w-6 text-primary" />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{event.organizer}</p>
                  <p className="text-sm text-muted-foreground capitalize">{event.organizerType}</p>
                </div>
              </div>
            </div>

            {/* Event Stats */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Event Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Attendees</span>
                  </div>
                  <span className="font-semibold">{event.attendees.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Interested</span>
                  </div>
                  <span className="font-semibold">{event.interested.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Category</span>
                  </div>
                  <Badge variant="secondary">{event.category}</Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Copy Event Link
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Event
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Tabs Section */}
        <div className="mt-8">
          <div className="border-b border-border/50 mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("information")}
                className={`pb-3 text-sm font-medium transition-all duration-300 relative ${
                  activeTab === "information"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Information
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-300 ${
                    activeTab === "information"
                      ? "opacity-100 scale-x-100"
                      : "opacity-0 scale-x-0"
                  }`}
                />
              </button>
              <button
                onClick={() => setActiveTab("discussion")}
                className={`pb-3 text-sm font-medium transition-all duration-300 relative ${
                  activeTab === "discussion"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Discussion
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-300 ${
                    activeTab === "discussion"
                      ? "opacity-100 scale-x-100"
                      : "opacity-0 scale-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "information" ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">About this event</h3>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Category</h3>
                <Badge variant="secondary">{event.category}</Badge>
              </div>
              {event.agenda && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Agenda</h3>
                  <div className="space-y-3">
                    {event.agenda.map((item, index) => (
                      <div key={index} className="flex gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="font-medium text-primary min-w-0">{item.time}</div>
                        <div className="flex-1">{item.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Comment Input */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Who all is going to be there?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleComment}
                    disabled={!comment.trim()}
                  >
                    Post
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {displayedComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{comment.author}</span>
                          {comment.replyTo && (
                            <span className="text-sm text-muted-foreground">replying to {comment.replyTo}</span>
                          )}
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1 hover:text-primary transition-colors ${
                            comment.isLiked ? "text-primary" : ""
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${comment.isLiked ? "fill-current" : ""}`} />
                          {comment.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          {comment.replies}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Repeat2 className="h-4 w-4" />
                          {comment.reposts}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {comments.length > 3 && (
                <div className="text-center mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllComments(!showAllComments)}
                  >
                    {showAllComments ? "Show Less" : `Show All ${comments.length} Comments`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout.Main>
  )
}