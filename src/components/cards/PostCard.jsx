import { useState, useCallback, useMemo } from "react"
import { ArrowUp, ArrowDown, MessageCircle, Share2, Bookmark, MoreHorizontal, BadgeCheck, X, Heart, Eye, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Link, useNavigate } from "react-router-dom"

export function PostCard({ post }) {
  const navigate = useNavigate()
  const [votes, setVotes] = useState(post.votes || 0)
  const [hasVoted, setHasVoted] = useState(post.hasVoted || null)
  const [isSaved, setIsSaved] = useState(false)
  const [isImageExpanded, setIsImageExpanded] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)

  if (!post) {
    return null
  }

  // Memoized values for performance
  const isVoicePost = useMemo(() => post.contentType === "voice", [post.contentType])
  const profileUrl = useMemo(() => `/profile/${post.authorType}/${post.author}`, [post.authorType, post.author])
  const formattedVotes = useMemo(() => votes > 999 ? `${(votes / 1000).toFixed(1)}k` : votes, [votes])
  const shouldTruncateContent = useMemo(() => post.content && post.content.length > 200, [post.content])
  const displayContent = useMemo(() => {
    if (!shouldTruncateContent || showFullContent) return post.content
    return post.content.substring(0, 200) + "..."
  }, [post.content, shouldTruncateContent, showFullContent])

  // Optimized event handlers
  const handleVote = useCallback((type) => {
    if (hasVoted === type) {
      setVotes(prev => prev + (type === "up" ? -1 : 1))
      setHasVoted(null)
    } else if (hasVoted) {
      setVotes(prev => prev + (type === "up" ? 2 : -2))
      setHasVoted(type)
    } else {
      setVotes(prev => prev + (type === "up" ? 1 : -1))
      setHasVoted(type)
    }
  }, [hasVoted])

  const handlePostClick = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("scrollPosition", window.scrollY.toString())
    }
    navigate(`/post/${post.id}`)
  }, [navigate, post.id])

  const handleImageClick = useCallback((e) => {
    e.stopPropagation()
    setIsImageExpanded(true)
  }, [])

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true)
  }, [])

  const toggleSave = useCallback(() => {
    setIsSaved(prev => !prev)
  }, [])

  const toggleContent = useCallback(() => {
    setShowFullContent(prev => !prev)
  }, [])

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col gap-4 rounded-xl border-2 bg-card/95 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 cursor-pointer transform hover:-translate-y-1",
          "hover:bg-card/90",
          "shadow-lg shadow-black/5",
          isVoicePost
            ? "border-primary/50 bg-linear-to-r from-primary/10 to-primary/15 hover:from-primary/15 hover:to-primary/20 shadow-primary/10"
            : "border-border/60",
          post.authorType === "institution" && !isVoicePost && "bg-blue-500/5 border-blue-800/40 shadow-blue-500/5",
        )}
        onClick={handlePostClick}
        role="article"
        aria-label={`Post by ${post.author}: ${post.title}`}
      >
        {/* Voice Post Indicator */}
        {isVoicePost && (
          <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            🎤 VOICE
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 space-y-4">
          {/* Post Header */}
          <div className="flex items-center gap-3 text-sm">
            <Link
              to={`/community/${post.community}`}
              className="font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
              onClick={(e) => e.stopPropagation()}
            >
              {post.community}
            </Link>

            <div className="flex items-center gap-2">
              <Link to={profileUrl} onClick={(e) => e.stopPropagation()}>
                <Avatar className="h-6 w-6 ring-2 ring-transparent hover:ring-primary/20 transition-all cursor-pointer">
                  <AvatarImage src={post.authorAvatar || "/placeholder.svg"} alt={post.author} />
                  <AvatarFallback className="text-xs font-semibold">
                    {post.author[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Link
                to={profileUrl}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-muted-foreground">
                  {post.authorType === "individual" ? "u/" : ""}
                  {post.author}
                </span>
                {post.authorType === "institution" && (
                  <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
                )}
              </Link>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{post.timestamp}</span>
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors cursor-pointer text-balance">
              {post.title}
            </h2>

            {post.content && (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  {displayContent}
                </p>
                {shouldTruncateContent && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-primary hover:text-primary/80 text-xs font-medium"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleContent()
                    }}
                  >
                    {showFullContent ? "Show less" : "Read more"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Post Image */}
          {post.image && (
            <div
              className="relative aspect-video overflow-hidden rounded-lg cursor-pointer group/image"
              onClick={handleImageClick}
            >
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse rounded-lg flex items-center justify-center">
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className={cn(
                  "w-full h-full object-cover transition-all duration-300 group-hover/image:scale-105",
                  isImageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={handleImageLoad}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 rounded-lg" />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/image:opacity-100 transition-opacity">
                Click to expand
              </div>
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              {/* Voting Section - Integrated into Post Actions */}
              <div className="flex items-center gap-2 mr-4 pr-4 border-r border-border/30">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 transition-all duration-200 hover:scale-110",
                    hasVoted === "up" && "text-primary hover:text-primary bg-primary/10"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVote("up")
                  }}
                  aria-label={`Upvote post: ${formattedVotes} votes`}
                >
                  <ArrowUp className={cn("h-4 w-4 transition-transform", hasVoted === "up" && "scale-110")} />
                </Button>

                <span
                  className={cn(
                    "text-sm font-bold tabular-nums transition-colors min-w-[2rem] text-center",
                    hasVoted === "up" && "text-primary",
                    hasVoted === "down" && "text-destructive",
                  )}
                >
                  {formattedVotes}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 transition-all duration-200 hover:scale-110",
                    hasVoted === "down" && "text-destructive hover:text-destructive bg-destructive/10"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVote("down")
                  }}
                  aria-label={`Downvote post: ${formattedVotes} votes`}
                >
                  <ArrowDown className={cn("h-4 w-4 transition-transform", hasVoted === "down" && "scale-110")} />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-primary/5 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{post.comments}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-primary/5 hover:text-primary transition-colors"
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
                  isSaved
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "hover:bg-primary/5 hover:text-primary"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSave()
                }}
              >
                <Bookmark className={cn("h-4 w-4 transition-transform", isSaved && "fill-current scale-110")} />
                <span className="text-sm font-medium">{isSaved ? "Saved" : "Save"}</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/5 hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </article>

      {/* Enhanced Image Modal */}
      {isImageExpanded && post.image && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setIsImageExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-modal-title"
        >
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <div className="bg-black/60 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
              <h3 id="image-modal-title" className="text-sm font-medium">{post.title}</h3>
              <p className="text-xs text-gray-300">by {post.author} in {post.community}</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110"
              onClick={() => setIsImageExpanded(false)}
              aria-label="Close image modal"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="relative max-w-[90vw] max-h-[85vh] animate-in zoom-in-95 duration-300">
            <img
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image Actions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border-0"
                onClick={(e) => {
                  e.stopPropagation()
                  // Copy image URL to clipboard
                  navigator.clipboard?.writeText(post.image)
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Image
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border-0"
                onClick={(e) => {
                  e.stopPropagation()
                  // Download image
                  const link = document.createElement('a')
                  link.href = post.image
                  link.download = `${post.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`
                  link.click()
                }}
              >
                <ArrowDown className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
