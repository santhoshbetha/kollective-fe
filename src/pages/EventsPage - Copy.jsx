import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Layout from '../components/Layout'
import { EventCard } from '../components/cards/EventCard'
import {
  Calendar,
  MapPin,
  Search,
  Video,
  Plus,
} from "lucide-react"
import { Link } from "react-router-dom"

const mockEvents = [
  {
    id: 1,
    title: "AI & Machine Learning Summit 2025",
    description:
      "Join industry leaders and researchers for a deep dive into the latest advancements in AI and machine learning. Network with professionals and explore cutting-edge technologies.",
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
  },
  {
    id: 2,
    title: "Web Development Bootcamp: React & Next.js",
    description:
      "A comprehensive 3-hour workshop covering modern web development with React and Next.js. Perfect for intermediate developers looking to level up their skills.",
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
  },
  {
    id: 3,
    title: "Startup Pitch Night: Connect with Investors",
    description:
      "Early-stage startups present their ideas to a panel of venture capitalists and angel investors. Great networking opportunity for entrepreneurs and investors alike.",
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
  },
  {
    id: 4,
    title: "Climate Action Workshop: Building Sustainable Solutions",
    description:
      "Interactive workshop focused on developing practical solutions for climate change. Collaborate with scientists, engineers, and activists to make a real impact.",
    image: "/climate-change-environment-workshop.jpg",
    date: "2025-01-22",
    time: "10:00 AM - 4:00 PM",
    location: "Online via Microsoft Teams",
    type: "online",
    category: "Environment",
    organizer: "MIT_Research",
    organizerAvatar: "/mit-logo.png",
    organizerType: "institution",
    attendees: 789,
    interested: 1456,
    isInterested: true,
  },
  {
    id: 5,
    title: "Photography Masterclass: Portrait Techniques",
    description:
      "Learn professional portrait photography techniques from award-winning photographer. Hands-on session with live models and personalized feedback.",
    image: "/photography-workshop-portrait-camera.jpg",
    date: "2025-01-25",
    time: "1:00 PM - 6:00 PM",
    location: "Creative Studio, Los Angeles",
    type: "in-person",
    category: "Arts",
    organizer: "photoMaster",
    organizerAvatar: "/photographer-avatar.png",
    organizerType: "individual",
    attendees: 45,
    interested: 123,
    isInterested: false,
  },
  {
    id: 6,
    title: "Blockchain & Cryptocurrency Forum 2025",
    description:
      "Explore the future of finance with blockchain technology and cryptocurrency. Expert panels, workshops, and networking sessions with industry pioneers.",
    image: "/blockchain-cryptocurrency-conference.jpg",
    date: "2025-01-28",
    time: "9:00 AM - 6:00 PM",
    location: "Miami Convention Center",
    type: "in-person",
    category: "Finance",
    organizer: "CryptoFoundation",
    organizerAvatar: "/crypto-foundation-logo.jpg",
    organizerType: "institution",
    attendees: 2341,
    interested: 5678,
    isInterested: false,
  },
  {
    id: 7,
    title: "Mental Health & Wellness Seminar",
    description:
      "Join mental health professionals for an informative session on stress management, mindfulness, and building resilience in today's fast-paced world.",
    image: "/mental-health-wellness-meditation.png",
    date: "2025-02-01",
    time: "3:00 PM - 5:00 PM",
    location: "Online via Zoom",
    type: "online",
    category: "Health",
    organizer: "Dr. Sarah Johnson",
    organizerAvatar: "/doctor-professional-woman.jpg",
    organizerType: "individual",
    attendees: 678,
    interested: 1234,
    isInterested: true,
  },
  {
    id: 8,
    title: "Game Development Jam: 48-Hour Challenge",
    description:
      "Create a complete game in 48 hours! Team up with developers, artists, and designers. Prizes for the most innovative games. All skill levels welcome.",
    image: "/game-development-gaming-hackathon.jpg",
    date: "2025-02-05",
    time: "6:00 PM (Fri) - 6:00 PM (Sun)",
    location: "Tech Campus, Seattle",
    type: "in-person",
    category: "Gaming",
    organizer: "GameDevCommunity",
    organizerAvatar: "/gaming-community-logo.png",
    organizerType: "institution",
    attendees: 156,
    interested: 423,
    isInterested: false,
  },
]

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [events, setEvents] = useState(mockEvents)
  const navigate = useNavigate()

  const categories = [
    "all",
    "Technology",
    "Education",
    "Business",
    "Environment",
    "Arts",
    "Finance",
    "Health",
    "Gaming",
  ]

  const handleInterested = (eventId) => {
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              isInterested: !event.isInterested,
              interested: event.isInterested ? event.interested - 1 : event.interested + 1,
            }
          : event,
      ),
    )
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
    const matchesType = selectedType === "all" || event.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  return (
    <Layout.Main>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Discover Events</h1>
          <p className="text-muted-foreground">Find and join events that match your interests</p>
        </div>
        <Button 
          onClick={() => navigate("/events/create")} 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("all")}
              >
                All Events
              </Button>
              <Button
                variant={selectedType === "online" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("online")}
                className="gap-2"
              >
                <Video className="h-4 w-4" />
                Online
              </Button>
              <Button
                variant={selectedType === "in-person" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("in-person")}
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                In-Person
              </Button>
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

          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onInterested={handleInterested}
              />
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
    </Layout.Main>
  )
}

export default EventsPage