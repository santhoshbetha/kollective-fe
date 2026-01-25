import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
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
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function EventCard({ event, onInterested }) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/events/${event.id}`)
  }

  const handleInterestedClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onInterested(event.id)
  }

  const handleShareClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Handle share functionality
  }

  const isUpcoming = new Date(event.date) > new Date()
  const isToday = new Date(event.date).toDateString() === new Date().toDateString()

  return (
    <div
      className="group block rounded-lg border bg-card overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
      onClick={handleCardClick}>
      {/* Gradient overlay on hover - positioned to not block mouse events */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      <div className="grid lg:grid-cols-[280px_1fr] gap-0">
        <div className="relative h-40 lg:h-full overflow-hidden">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Enhanced badges with animations */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className="gap-1.5 bg-black/80 text-white border-0 shadow-lg backdrop-blur-sm hover:bg-black transition-colors">
              {event.type === "online" ? (
                <>
                  <Video className="h-3 w-3" />
                  Online
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3" />
                  In-Person
                </>
              )}
            </Badge>

            {isToday && (
              <Badge className="gap-1.5 bg-red-500/90 text-white border-0 shadow-sm backdrop-blur-sm animate-pulse">
                <Sparkles className="h-3 w-3" />
                Today
              </Badge>
            )}

            {isUpcoming && !isToday && (
              <Badge className="gap-1.5 bg-green-500/90 text-white border-0 shadow-sm backdrop-blur-sm">
                <Calendar className="h-3 w-3" />
                Upcoming
              </Badge>
            )}
          </div>

          {/* Attendee count overlay */}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-white text-sm font-medium">
            <Users className="h-3.5 w-3.5" />
            <span>{event.attendees}</span>
          </div>
        </div>

        <div className="p-4 flex flex-col relative z-20">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                {event.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>

          {/* Enhanced event details with better spacing */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-3 text-sm bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
              <Clock className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium">{event.time}</span>
            </div>

            <div className="flex items-center gap-3 text-sm bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
              {event.type === "online" ? (
                <Video className="h-4 w-4 text-primary flex-shrink-0" />
              ) : (
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              )}
              <span className="font-medium line-clamp-1">{event.location}</span>
            </div>
          </div>

          {/* Enhanced organizer section */}
          <div className="flex items-center gap-4 mb-4">
            <Link
              to={`/profile/${event.organizerType}/${event.organizer}`}
              className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 hover:scale-105"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                <img
                  src={event.organizerAvatar || "/placeholder.svg"}
                  alt={event.organizer}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                {event.organizerType === "individual" ? (
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="text-sm font-semibold hover:text-primary transition-colors">
                  {event.organizer}
                </span>
                {event.organizerType === "institution" && (
                  <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20" />
                )}
              </div>
            </Link>

            <Badge
              variant="secondary"
              className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {event.category}
            </Badge>
          </div>

          {/* Enhanced footer with better interactions */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                <Users className="h-4 w-4" />
                <span className="font-medium">{event.attendees} attending</span>
              </div>
              <div className="flex items-center gap-2 hover:text-red-500 transition-colors cursor-pointer">
                <Heart className="h-4 w-4" />
                <span className="font-medium">{event.interested} interested</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                onClick={handleShareClick}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button
                variant={event.isInterested ? "default" : "outline"}
                size="sm"
                onClick={handleInterestedClick}
                className={cn(
                  "gap-2 transition-all duration-200",
                  event.isInterested
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
                    : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
                )}
              >
                <Heart className={cn("h-4 w-4 transition-all", event.isInterested && "fill-current animate-pulse")} />
                <span className="hidden sm:inline">
                  {event.isInterested ? "Interested" : "Interested?"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}