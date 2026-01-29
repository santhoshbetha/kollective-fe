import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { MapPin, Users, Share2, User, Building2, CheckCircle2, Heart, TrendingUp, DollarSign, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const BusinessProposalCard = ({ proposal, onInterested }) => {
  const navigate = useNavigate()

  const handleInterested = (e) => {
    e.stopPropagation()
    onInterested(proposal.id)
  }

  // Calculate funding progress (mock data - in real app this would come from API)
  const fundingProgress = Math.floor(Math.random() * 100) // Mock progress
  const isHot = proposal.interested > 20 // Mock hot proposal logic
  const isNew = new Date(proposal.postedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // New in last 7 days

  return (
    <div
      onClick={() => navigate(`/businesses/proposal/${proposal.id}`)}
      className="group relative rounded-xl border bg-card p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

      {/* Status badges */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {isHot && (
          <Badge className="gap-1 bg-red-500/90 text-white border-0 shadow-sm backdrop-blur-sm animate-pulse">
            <TrendingUp className="h-3 w-3" />
            Hot
          </Badge>
        )}
        {isNew && (
          <Badge className="gap-1 bg-blue-500/90 text-white border-0 shadow-sm backdrop-blur-sm">
            <span className="text-xs">NEW</span>
          </Badge>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {proposal.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {proposal.description}
          </p>
        </div>
      </div>

      {/* Enhanced investment details */}
      <div className="grid md:grid-cols-3 gap-4 mb-6 relative z-10">
        <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <p className="text-xs text-muted-foreground font-medium">Investment Range</p>
          </div>
          <p className="text-sm font-bold text-green-700">{proposal.investment}</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground font-medium">Location</p>
          </div>
          <p className="text-sm font-semibold line-clamp-1">{proposal.location}</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <p className="text-xs text-muted-foreground font-medium">Posted</p>
          </div>
          <p className="text-sm font-semibold">
            {new Date(proposal.postedDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Funding Progress Bar */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Funding Progress</span>
          <span className="text-sm font-bold text-primary">{fundingProgress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-linear-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${fundingProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">Current: ${(fundingProgress * 10).toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">Goal: $1,000,000</span>
        </div>
      </div>

      {/* Enhanced footer */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <Link
            to={`/profile/${proposal.proposerType}/${proposal.proposer}`}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 hover:scale-105"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              <img
                src={proposal.proposerAvatar || "/placeholder.svg"}
                alt={proposal.proposer}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              {proposal.proposerType === "individual" ? (
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-sm font-semibold hover:text-primary transition-colors">
                {proposal.proposer}
              </span>
              {proposal.proposerType === "institution" && (
                <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20" />
              )}
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {proposal.category}
            </Badge>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">{proposal.interested} interested</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={proposal.isInterested ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-2 transition-all duration-200",
              proposal.isInterested
                ? "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
                : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
            )}
            onClick={handleInterested}
          >
            <Heart className={cn("h-4 w-4 transition-all", proposal.isInterested && "fill-current animate-pulse")} />
            <span className="hidden sm:inline">
              {proposal.isInterested ? "Interested" : "Show Interest"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BusinessProposalCard