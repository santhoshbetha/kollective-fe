import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import {
  MapPin,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Building2,
  User,
  Heart,
  MessageCircle,
  MoreHorizontal,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Briefcase,
  Target,
} from "lucide-react"

// Mock data
const mockProposals = [
  {
    id: 1,
    title: "Community Co-Working Space",
    description:
      "Looking for partners to open a modern co-working space in downtown. Target audience: freelancers and remote workers. Space includes private offices, meeting rooms, and common areas with high-speed internet, printing facilities, and a coffee bar. We have already secured a prime location and completed initial market research.",
    fullDescription:
      "This project aims to create a vibrant co-working community that brings together entrepreneurs, freelancers, and remote workers. The space will feature 50 dedicated desks, 10 private offices, 3 meeting rooms, a podcast recording studio, and a relaxation area. Our research shows strong demand in the area with over 5,000 potential members within a 5-mile radius.",
    category: "Real Estate",
    investment: "$50K - $100K",
    location: "Downtown San Francisco",
    proposer: "StartupAccelerator",
    proposerAvatar: "/startup-accelerator-logo.png",
    proposerType: "institution",
    interested: 23,
    isInterested: false,
    postedDate: "2025-01-10",
    timeline: "6-8 months to launch",
    lookingFor: ["Co-founder", "Real Estate Partner", "Marketing Expert"],
    projectedRevenue: "$200K - $300K annually",
    businessModel: "Membership-based with tiered pricing",
    targetMarket: "Tech professionals, freelancers, small startups (25-45 age group)",
    milestones: [
      "Q1 2025: Finalize location and partners",
      "Q2 2025: Complete renovations and setup",
      "Q3 2025: Soft launch with 50% capacity",
      "Q4 2025: Full launch and marketing campaign",
    ],
  },
  {
    id: 2,
    title: "Organic Food Delivery Service",
    description:
      "Seeking co-founders to launch farm-to-table delivery service connecting local farmers with health-conscious consumers. Initial phase covers Bay Area.",
    fullDescription:
      "Our mission is to make organic, locally-sourced food accessible to busy families and health-conscious individuals. We've established relationships with 15 organic farms in the region and developed a subscription-based model that guarantees fresh deliveries within 24 hours of harvest.",
    category: "Food & Beverage",
    investment: "$30K - $50K",
    location: "Bay Area, CA",
    proposer: "ecoFarmer_mike",
    proposerAvatar: "/farmer-organic-vegetables.jpg",
    proposerType: "individual",
    interested: 45,
    isInterested: true,
    postedDate: "2025-01-12",
    timeline: "3-4 months to launch",
    lookingFor: ["Operations Manager", "Marketing Specialist", "Tech Developer"],
    projectedRevenue: "$150K - $250K in year one",
    businessModel: "Weekly subscription boxes + on-demand ordering",
    targetMarket: "Health-conscious families, fitness enthusiasts, age 28-55",
    milestones: [
      "Month 1: Build platform and onboard farms",
      "Month 2: Beta testing with 50 customers",
      "Month 3: Public launch and marketing",
      "Month 4-6: Scale to 500 active subscribers",
    ],
  },
  {
    id: 3,
    title: "Mobile Pet Grooming Franchise",
    description:
      "Expanding mobile pet grooming business looking for franchise partners. Proven business model with excellent margins. Training and equipment provided.",
    fullDescription:
      "Our mobile pet grooming service brings professional grooming directly to pet owners' doorsteps. We've developed proprietary techniques and equipment that ensure stress-free grooming experiences for pets. The franchise model includes comprehensive training, marketing support, and ongoing operational assistance.",
    category: "Services",
    investment: "$25K - $40K",
    location: "Multiple Locations",
    proposer: "PetCare Pro",
    proposerAvatar: "/pet-care-company-logo.jpg",
    proposerType: "institution",
    interested: 18,
    isInterested: false,
    postedDate: "2025-01-08",
    timeline: "2-3 months to launch",
    lookingFor: ["Franchise Owner", "Operations Manager", "Marketing Coordinator"],
    projectedRevenue: "$80K - $120K annually per location",
    businessModel: "Mobile service with subscription options",
    targetMarket: "Pet owners, busy professionals, age 25-65",
    milestones: [
      "Week 1-2: Complete training program",
      "Week 3-4: Equipment setup and marketing",
      "Month 2: Launch operations",
      "Month 3: Reach profitability",
    ],
  },
  {
    id: 4,
    title: "Eco-Friendly Cleaning Products",
    description:
      "Innovative line of biodegradable cleaning products ready for market. Need business partner with retail or distribution experience to scale operations.",
    fullDescription:
      "We've developed a complete line of eco-friendly cleaning products using plant-based ingredients and biodegradable packaging. Our products outperform traditional cleaners while being completely safe for children and pets. We've completed product development, packaging design, and initial testing.",
    category: "Manufacturing",
    investment: "$20K - $35K",
    location: "San Francisco, CA",
    proposer: "greenChem_labs",
    proposerAvatar: "/scientist-in-laboratory.jpg",
    proposerType: "individual",
    interested: 31,
    isInterested: false,
    postedDate: "2025-01-14",
    timeline: "4-6 months to launch",
    lookingFor: ["Business Partner", "Distribution Expert", "Marketing Manager"],
    projectedRevenue: "$500K - $1M in year one",
    businessModel: "Direct-to-consumer + retail partnerships",
    targetMarket: "Eco-conscious consumers, families, age 25-55",
    milestones: [
      "Month 1: Finalize partnership agreements",
      "Month 2: Manufacturing setup",
      "Month 3: Marketing campaign launch",
      "Month 4-6: Scale distribution network",
    ],
  },
]

const mockComments = [
  {
    id: 1,
    author: "investor_jane",
    authorAvatar: "/professional-woman-diverse.png",
    authorType: "individual",
    content: "This sounds like a great opportunity! I'm interested in learning more about the financial projections.",
    timestamp: "2 days ago",
  },
  {
    id: 2,
    author: "BusinessConsultCo",
    authorAvatar: "/tech-company-logo.jpg",
    authorType: "institution",
    content: "We've worked on similar projects. Would love to discuss potential partnership opportunities. DM us!",
    timestamp: "1 day ago",
  },
]

export default function BusinessProposalDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const proposalId = Number.parseInt(id)
  const proposal = mockProposals.find((p) => p.id === proposalId) || mockProposals[0]

  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState(mockComments)
  const [isInterested, setIsInterested] = useState(proposal.isInterested)
  const [interestedCount, setInterestedCount] = useState(proposal.interested)

  // Scroll to top when component mounts
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
    }, 100)
  }, [])

  const handleInterested = () => {
    setIsInterested(!isInterested)
    setInterestedCount(isInterested ? interestedCount - 1 : interestedCount + 1)
  }

  const handlePostComment = () => {
    if (!commentText.trim()) return

    const newComment = {
      id: comments.length + 1,
      author: "currentUser",
      authorAvatar: "/tech-enthusiast.png",
      authorType: "individual",
      content: commentText,
      timestamp: "Just now",
    }

    setComments([newComment, ...comments])
    setCommentText("")
  }

  return (
    <Layout.Main>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/businesses")} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Businesses
        </Button>

        <div className="rounded-lg border bg-card overflow-hidden">
          {/* Proposal Header */}
          <div className="p-6 border-b bg-linear-to-r from-primary/10 to-primary/5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-3">
                  {proposal.category}
                </Badge>
                <h1 className="text-3xl font-bold mb-3">{proposal.title}</h1>
                <p className="text-muted-foreground leading-relaxed mb-4">{proposal.description}</p>
                <Link
                  to={`/profile/${proposal.proposerType}/${proposal.proposer}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <img
                      src={proposal.proposerAvatar || "/placeholder.svg"}
                      alt={proposal.proposer}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Posted by</span>
                    {proposal.proposerType === "individual" ? (
                      <User className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="font-medium">{proposal.proposer}</span>
                    {proposal.proposerType === "institution" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Key Details Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-muted/50">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Investment</div>
                  <div className="font-semibold text-sm">{proposal.investment}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Location</div>
                  <div className="font-semibold text-sm">{proposal.location}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Timeline</div>
                  <div className="font-semibold text-sm">{proposal.timeline}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Interested</div>
                  <div className="font-semibold text-sm">{interestedCount} people</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant={isInterested ? "default" : "outline"}
                onClick={handleInterested}
                className="flex-1 gap-2"
              >
                <Heart className={`h-4 w-4 ${isInterested ? "fill-current" : ""}`} />
                {isInterested ? "Interested" : "Show Interest"}
              </Button>
              <Button variant="outline" className="flex-1 gap-2 bg-transparent">
                <MessageCircle className="h-4 w-4" />
                Contact Proposer
              </Button>
            </div>

            {/* Detailed Information */}
            <div className="space-y-6">
              {/* Full Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Full Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">{proposal.fullDescription}</p>
              </div>

              {/* Business Model */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Business Model
                </h3>
                <p className="text-muted-foreground">{proposal.businessModel}</p>
                <div className="mt-2 p-3 rounded-lg bg-muted/50">
                  <div className="text-sm font-medium mb-1">Projected Revenue</div>
                  <div className="text-lg font-semibold text-primary">{proposal.projectedRevenue}</div>
                </div>
              </div>

              {/* Target Market */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Target Market
                </h3>
                <p className="text-muted-foreground">{proposal.targetMarket}</p>
              </div>

              {/* Looking For */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Looking For</h3>
                <div className="flex flex-wrap gap-2">
                  {proposal.lookingFor.map((role, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Project Milestones</h3>
                <div className="space-y-2">
                  {proposal.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussion */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Discussion</h3>

                {/* Comment Input */}
                <div className="space-y-3 mb-6">
                  <Textarea
                    placeholder="Ask questions or share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handlePostComment} disabled={!commentText.trim()}>
                      Post Comment
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 rounded-lg border bg-muted/30">
                      <Link
                        to={`/profile/${comment.authorType}/${comment.author}`}
                        className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={comment.authorAvatar || "/placeholder.svg"}
                          alt={comment.author}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/profile/${comment.authorType}/${comment.author}`}
                            className="font-semibold hover:underline"
                          >
                            {comment.author}
                          </Link>
                          {comment.authorType === "institution" && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-sm text-muted-foreground">· {comment.timestamp}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
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