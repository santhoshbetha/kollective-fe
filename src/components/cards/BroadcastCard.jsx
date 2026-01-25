import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import { Eye, Heart, MessageCircle, Clock, User, Building2, CheckCircle2, Radio, Play } from "lucide-react"
import { cn } from "@/lib/utils"

const BroadcastCard = ({ broadcast }) => {
  const navigate = useNavigate()

  return (
    <div
      className="group relative rounded-xl border bg-card overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
      onClick={() => navigate(`/broadcasting/${broadcast.id}`)}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

      <div className="relative aspect-video overflow-hidden">
        <img
          src={broadcast.thumbnail || "/placeholder.svg"}
          alt={broadcast.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Enhanced live indicator with glow effect */}
        {broadcast.isLive && (
          <div className="absolute top-3 left-3">
            <Badge className="gap-1.5 bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-500/25 animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-sm"></span>
              </span>
              <span className="font-bold tracking-wide">LIVE</span>
            </Badge>
          </div>
        )}

        {/* Play button overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-6 w-6 text-primary fill-primary ml-0.5" />
          </div>
        </div>

        {/* Enhanced duration badge */}
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg">
          {broadcast.duration}
        </div>

        {/* Enhanced viewer count with better styling */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg">
          <Eye className="h-3.5 w-3.5" />
          <span>{broadcast.viewers.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-5 relative z-20">
        <h3 className="font-bold mb-2 line-clamp-2 text-lg leading-tight group-hover:text-primary transition-colors">
          {broadcast.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {broadcast.description}
        </p>

        {/* Enhanced broadcaster section */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to={`/profile/${broadcast.broadcasterType}/${broadcast.broadcaster}`}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 hover:scale-105"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              <img
                src={broadcast.broadcasterAvatar || "/placeholder.svg"}
                alt={broadcast.broadcaster}
                className="w-full h-full object-cover"
              />
              {broadcast.isLive && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full p-1">
                  <Radio className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {broadcast.broadcasterType === "individual" ? (
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-sm font-semibold hover:text-primary transition-colors">
                {broadcast.broadcaster}
              </span>
              {broadcast.broadcasterType === "institution" && (
                <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20" />
              )}
            </div>
          </Link>

          <Badge
            variant="secondary"
            className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
          >
            {broadcast.category}
          </Badge>
        </div>

        {/* Enhanced footer with better interactions */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 hover:text-red-500 transition-colors cursor-pointer">
              <Heart className="h-4 w-4" />
              <span className="font-medium">{broadcast.likes}</span>
            </div>
            <div className="flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{broadcast.comments}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{broadcast.startedAt}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BroadcastCard