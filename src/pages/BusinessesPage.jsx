import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import BusinessCard from "@/components/cards/BusinessCard"
import BusinessProposalCard from "@/components/cards/BusinessProposalCard"
import {
  MapPin,
  Search,
  Phone,
  Globe,
  Clock,
  Star,
  Plus,
  ThumbsUp,
  Share2,
  Building2,
  User,
  CheckCircle2,
  Heart,
  Users,
} from "lucide-react"

const mockBusinesses = [
  {
    id: 1,
    name: "Tech Repair Pro",
    description:
      "Professional electronics repair service specializing in smartphones, laptops, and tablets. Quick turnaround with warranty on all repairs.",
    image: "/electronics-repair-shop.png",
    category: "Technology",
    address: "123 Main Street",
    city: "San Francisco, CA",
    phone: "(555) 123-4567",
    website: "techrepairpro.com",
    rating: 4.8,
    reviews: 247,
    hours: "Mon-Sat: 9AM-6PM",
    owner: "TechCorp",
    ownerAvatar: "/tech-company-logo.jpg",
    ownerType: "institution",
    verified: true,
  },
  {
    id: 2,
    name: "Green Leaf Cafe",
    description:
      "Organic coffee shop and bakery serving locally sourced ingredients. Cozy atmosphere perfect for work or meetings.",
    image: "/cozy-coffee-shop.png",
    category: "Food & Beverage",
    address: "456 Oak Avenue",
    city: "San Francisco, CA",
    phone: "(555) 234-5678",
    website: "greenleafcafe.com",
    rating: 4.9,
    reviews: 512,
    hours: "Daily: 7AM-8PM",
    owner: "sarahbaker",
    ownerAvatar: "/professional-woman-baker.jpg",
    ownerType: "individual",
    verified: false,
  },
  {
    id: 3,
    name: "FitZone Gym",
    description:
      "State-of-the-art fitness center with personal trainers, group classes, and modern equipment. First week free!",
    image: "/modern-gym-equipment.png",
    category: "Health & Fitness",
    address: "789 Fitness Boulevard",
    city: "San Francisco, CA",
    phone: "(555) 345-6789",
    website: "fitzonegym.com",
    rating: 4.7,
    reviews: 356,
    hours: "24/7 Access",
    owner: "FitZone Inc",
    ownerAvatar: "/fitness-company-logo.jpg",
    ownerType: "institution",
    verified: true,
  },
  {
    id: 4,
    name: "Artisan Bookshop",
    description:
      "Independent bookstore featuring curated collections, rare finds, and local author events. Community reading space available.",
    image: "/cozy-bookstore-interior.jpg",
    category: "Retail",
    address: "321 Book Lane",
    city: "San Francisco, CA",
    phone: "(555) 456-7890",
    website: "artisanbookshop.com",
    rating: 4.9,
    reviews: 189,
    hours: "Mon-Sun: 10AM-7PM",
    owner: "bookworm_jen",
    ownerAvatar: "/woman-with-glasses-reading.jpg",
    ownerType: "individual",
    verified: false,
  },
]

const mockProposals = [
  {
    id: 1,
    title: "Community Co-Working Space",
    description:
      "Looking for partners to open a modern co-working space in downtown. Target audience: freelancers and remote workers. Space includes private offices, meeting rooms, and common areas.",
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

export default function BusinessesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [businesses] = useState(mockBusinesses)
  const [proposals, setProposals] = useState(mockProposals)
  const navigate = useNavigate()

  const categories = [
    "all",
    "Technology",
    "Food & Beverage",
    "Health & Fitness",
    "Retail",
    "Services",
    "Real Estate",
    "Manufacturing",
  ]

  const handleInterested = (proposalId) => {
    setProposals(
      proposals.map((proposal) =>
        proposal.id === proposalId
          ? {
              ...proposal,
              isInterested: !proposal.isInterested,
              interested: proposal.isInterested ? proposal.interested - 1 : proposal.interested + 1,
            }
          : proposal,
      ),
    )
  }

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || business.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || proposal.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Layout.Main>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Local Businesses</h1>
        <p className="text-muted-foreground">Discover and support businesses in your community</p>
      </div>

      <Tabs defaultValue="businesses" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="proposals">Business Proposals</TabsTrigger>
          </TabsList>
          <Button onClick={() => navigate("/businesses/post")} className="gap-2">
            <Plus className="h-4 w-4" />
            Post Business
          </Button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search businesses and proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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

        <TabsContent value="businesses" className="space-y-4 mt-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4 mt-6">
          {filteredProposals.map((proposal) => (
            <BusinessProposalCard
              key={proposal.id}
              proposal={proposal}
              onInterested={handleInterested}
            />
          ))}

          {filteredProposals.length === 0 && (
            <div className="text-center py-12">
              <ThumbsUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout.Main>
  )
}