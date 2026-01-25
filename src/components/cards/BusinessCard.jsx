import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { MapPin, Phone, Globe, Clock, Star, Share2, User, Building2, CheckCircle2, ExternalLink, PhoneCall } from "lucide-react"
import { cn } from "@/lib/utils"

const BusinessCard = ({ business }) => {
  const navigate = useNavigate()

  // Helper function to render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3.5 w-3.5",
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ))
  }

  // Check if business is currently open (simplified logic)
  const isOpen = () => {
    const now = new Date()
    const currentHour = now.getHours()
    // Simplified: assume businesses are open 9 AM - 6 PM
    return currentHour >= 9 && currentHour < 18
  }

  return (
    <div
      onClick={() => navigate(`/businesses/${business.id}`)}
      className="group relative block rounded-xl border bg-card overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

      <div className="grid lg:grid-cols-[280px_1fr] gap-0">
        <div className="relative h-40 lg:h-full overflow-hidden">
          <img
            src={business.image || "/placeholder.svg"}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Enhanced badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {business.verified && (
              <Badge className="gap-1.5 bg-green-500/90 text-white border-0 shadow-sm backdrop-blur-sm">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            )}

            <Badge className={cn(
              "gap-1.5 border-0 shadow-sm backdrop-blur-sm",
              isOpen() ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
            )}>
              <div className={cn(
                "h-2 w-2 rounded-full",
                isOpen() ? "bg-white animate-pulse" : "bg-white"
              )} />
              {isOpen() ? "Open" : "Closed"}
            </Badge>
          </div>

          {/* Rating overlay */}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-1.5 text-white">
            <div className="flex items-center gap-0.5">
              {renderStars(business.rating)}
            </div>
            <span className="text-sm font-semibold ml-1">{business.rating}</span>
          </div>
        </div>

        <div className="p-4 flex flex-col relative z-20">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                {business.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                {business.description}
              </p>
            </div>
          </div>

          {/* Enhanced contact information */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-3 text-sm bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium line-clamp-1">
                {business.address}, {business.city}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium">{business.phone}</span>
            </div>

            {business.website && (
              <div className="flex items-center gap-3 text-sm bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
                <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href={`https://${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {business.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
              <Clock className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium">{business.hours}</span>
            </div>
          </div>

          {/* Enhanced owner section */}
          <div className="flex items-center gap-4 mb-4">
            <Link
              to={`/profile/${business.ownerType}/${business.owner}`}
              className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 hover:scale-105"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                <img
                  src={business.ownerAvatar || "/placeholder.svg"}
                  alt={business.owner}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                {business.ownerType === "individual" ? (
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="text-sm font-semibold hover:text-primary transition-colors">
                  {business.owner}
                </span>
                {business.ownerType === "institution" && (
                  <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20" />
                )}
              </div>
            </Link>

            <Badge
              variant="secondary"
              className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {business.category}
            </Badge>
          </div>

          {/* Enhanced footer with better interactions */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{business.reviews} reviews</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <PhoneCall className="h-4 w-4" />
                <span className="hidden sm:inline">Contact</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessCard