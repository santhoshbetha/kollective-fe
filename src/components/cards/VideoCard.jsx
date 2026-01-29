import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUp, ArrowDown, MessageCircle, Share2, Bookmark, BadgeCheck, Play, Eye, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const VideoCard = ({ video }) => {
  const [votes, setVotes] = useState(video.votes)
  const [hasVoted, setHasVoted] = useState(video.hasVoted)
  const [isSaved, setIsSaved] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const navigate = useNavigate()

  const handleVote = async (type, e) => {
    e.stopPropagation()
    if (isVoting) return

    setIsVoting(true)

    // Simulate API call delay
    setTimeout(() => {
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
      setIsVoting(false)
    }, 300)
  }

  const profileUrl = `/profile/${video.authorType}/${video.author}`

  // Format view count
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  return (
    <article
      className={cn(
        "group relative rounded-xl border bg-card p-4 md:p-5 transition-all duration-300 hover:border-primary/50 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
        video.authorType === "institution" && "border-primary/20 bg-linear-to-r from-primary/5 to-transparent",
      )}
      onClick={() => navigate(`/videos/${video.id}`)}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

      <div className="space-y-4 relative z-10">
        <div className="flex gap-4">
          {/* Enhanced thumbnail */}
          <div className="relative w-64 md:w-72 shrink-0 group/thumbnail">
            <img
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              className="w-full aspect-video object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
            />

            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg transform scale-75 group-hover/thumbnail:scale-100 transition-transform duration-300">
                <Play className="h-6 w-6 text-primary fill-primary ml-0.5" />
              </div>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white shadow-lg">
              {video.duration}
            </div>

            {/* View count overlay */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg flex items-center gap-1.5">
              <Eye className="h-3 w-3" />
              <span>{formatViews(video.views)}</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {/* Category badge */}
            <div className="flex items-start gap-2">
              <Badge
                variant="secondary"
                className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {video.category}h
              </Badge>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors text-balance line-clamp-2">
              {video.title}
            </h2>

            {/* Author info */}
            <div className="flex items-center gap-3 text-sm">
              <Link
                to={profileUrl}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 hover:scale-105"
              >
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  <AvatarImage src={video.authorAvatar || "/placeholder.svg"} alt={video.author} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {video.author[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                    {video.authorType === "individual" ? "u/" : ""}
                    {video.author}
                  </span>
                  {video.authorType === "institution" && (
                    <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
                  )}
                </div>
              </Link>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{formatViews(video.views)} views</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{video.timestamp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced engagement buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200 hover:scale-110",
                hasVoted === "up" && "text-green-500 bg-green-50 hover:bg-green-100",
                isVoting && "animate-pulse"
              )}
              onClick={(e) => handleVote("up", e)}
              disabled={isVoting}
            >
              <ArrowUp className={cn("h-4 w-4 transition-transform", hasVoted === "up" && "scale-110")} />
            </Button>

            <span
              className={cn(
                "text-sm font-bold tabular-nums transition-all duration-300 px-2",
                hasVoted === "up" && "text-green-600 scale-110",
                hasVoted === "down" && "text-red-600 scale-110",
                isVoting && "animate-pulse"
              )}
            >
              {votes > 999 ? `${(votes / 1000).toFixed(1)}k` : votes}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200 hover:scale-110",
                hasVoted === "down" && "text-red-500 bg-red-50 hover:bg-red-100",
                isVoting && "animate-pulse"
              )}
              onClick={(e) => handleVote("down", e)}
              disabled={isVoting}
            >
              <ArrowDown className={cn("h-4 w-4 transition-transform", hasVoted === "down" && "scale-110")} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{video.comments}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-sm font-medium">Share</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 transition-all duration-200",
              isSaved && "text-primary bg-primary/10"
            )}
            onClick={(e) => {
              e.stopPropagation()
              setIsSaved(!isSaved)
            }}
          >
            <Bookmark className={cn("h-4 w-4 transition-all", isSaved && "fill-current")} />
            <span className="text-sm font-medium">Save</span>
          </Button>
        </div>
      </div>
    </article>
  )
}

export default VideoCard