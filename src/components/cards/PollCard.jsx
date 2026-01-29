import { useState } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BadgeCheck, Clock, BarChart3, TrendingUp, Trophy, Vote } from "lucide-react"
import { cn } from "@/lib/utils"

const PollCard = ({ poll }) => {
  const [hasVoted, setHasVoted] = useState(poll.hasVoted)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isVoting, setIsVoting] = useState(false)
  const profileUrl = `/profile/${poll.authorType}/${poll.author}`

  const handleVote = async () => {
    if (selectedOption !== null && hasVoted === null) {
      setIsVoting(true)
      // Simulate API call
      setTimeout(() => {
        setHasVoted(selectedOption)
        setIsVoting(false)
      }, 800)
    }
  }

  const showResults = hasVoted !== null

  return (
    <article
      className={cn(
        "group relative rounded-xl border bg-card p-6 space-y-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
        poll.authorType === "institution" && "border-primary/20 bg-linear-to-r from-primary/5 to-transparent",
        showResults && "ring-1 ring-primary/20"
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

      {/* Poll Header */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3 flex-1">
          <Link to={profileUrl} className="transition-transform hover:scale-105">
            <Avatar className="h-11 w-11 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
              <AvatarImage src={poll.authorAvatar || "/placeholder.svg"} alt={poll.author} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {poll.author[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link to={profileUrl} className="flex items-center gap-2 hover:text-primary transition-colors">
              <span className="font-semibold text-foreground">
                {poll.authorType === "individual" ? "u/" : ""}
                {poll.author}
              </span>
              {poll.authorType === "institution" && (
                <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
              )}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{poll.timestamp}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className={cn(
                "font-medium",
                poll.duration.includes("left") ? "text-green-600" : "text-orange-600"
              )}>
                {poll.duration}
              </span>
            </div>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
        >
          {poll.category}
        </Badge>
      </div>

      {/* Poll Question */}
      <h3 className="text-lg font-bold text-foreground text-balance leading-tight relative z-10">
        {poll.question}
      </h3>

      {/* Poll Options */}
      <div className="space-y-3 relative z-10">
        {poll.options.map((option, index) => {
          const isSelected = selectedOption === option.id || hasVoted === option.id
          const isWinner = showResults && option.percentage === Math.max(...poll.options.map((o) => o.percentage))

          return (
            <div key={option.id} className="relative">
              <button
                onClick={() => !showResults && setSelectedOption(option.id)}
                disabled={showResults || isVoting}
                className={cn(
                  "w-full rounded-lg border-2 p-4 text-left transition-all duration-200 relative overflow-hidden group/option",
                  showResults ? "cursor-default" : "cursor-pointer hover:border-primary/50 hover:bg-accent hover:shadow-sm",
                  isSelected && !showResults && "border-primary bg-primary/5 shadow-md",
                  showResults && isWinner && "border-primary shadow-md",
                  showResults && !isWinner && "border-border",
                  isVoting && "animate-pulse"
                )}
              >
                {showResults && (
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-1000 ease-out rounded-lg",
                      isWinner ? "bg-linear-to-r from-primary/20 to-primary/10" : "bg-primary/5"
                    )}
                    style={{
                      width: `${option.percentage}%`,
                      animationDelay: `${index * 200}ms`
                    }}
                  />
                )}

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-medium text-foreground group-hover/option:text-primary transition-colors">
                      {option.text}
                    </span>
                    {showResults && isWinner && (
                      <Trophy className="h-4 w-4 text-yellow-500 animate-bounce" />
                    )}
                  </div>

                  {showResults && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={cn(
                          "text-sm font-bold",
                          isWinner ? "text-primary" : "text-muted-foreground"
                        )}>
                          {option.percentage}%
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {option.votes.toLocaleString()} votes
                        </div>
                      </div>
                    </div>
                  )}

                  {isSelected && !showResults && (
                    <Vote className="h-4 w-4 text-primary animate-pulse" />
                  )}
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Poll Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50 relative z-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          <span className="font-medium">{poll.totalVotes.toLocaleString()} total votes</span>
        </div>

        {!showResults && (
          <Button
            onClick={handleVote}
            disabled={selectedOption === null || isVoting}
            size="sm"
            className={cn(
              "gap-2 transition-all duration-200",
              selectedOption !== null && !isVoting && "bg-primary hover:bg-primary/90 animate-pulse"
            )}
          >
            {isVoting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Voting...
              </>
            ) : (
              <>
                <Vote className="h-4 w-4" />
                Vote
              </>
            )}
          </Button>
        )}

        {showResults && (
          <Badge variant="outline" className="gap-1.5 bg-green-50 text-green-700 border-green-200">
            <TrendingUp className="h-3.5 w-3.5" />
            Voted
          </Badge>
        )}
      </div>
    </article>
  )
}

export default PollCard