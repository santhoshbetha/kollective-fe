import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Building2,
  User,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Mail,
  Users,
  Award,
  TrendingUp,
} from "lucide-react"

// Mock data - in real app this would come from API
const mockBusinesses = [
  {
    id: 1,
    name: "Tech Repair Pro",
    description:
      "Professional electronics repair service specializing in smartphones, laptops, and tablets. Quick turnaround with warranty on all repairs. We pride ourselves on quality service and customer satisfaction. Our certified technicians have over 15 years of combined experience.",
    image: "/electronics-repair-shop.png",
    category: "Technology",
    address: "123 Main Street",
    city: "San Francisco, CA",
    phone: "(555) 123-4567",
    email: "contact@techrepairpro.com",
    website: "techrepairpro.com",
    rating: 4.8,
    reviews: 247,
    hours: "Mon-Sat: 9AM-6PM",
    owner: "TechCorp",
    ownerAvatar: "/tech-company-logo.jpg",
    ownerType: "institution",
    verified: true,
    yearEstablished: "2018",
    employees: "5-10",
    services: ["Smartphone Repair", "Laptop Repair", "Tablet Repair", "Data Recovery", "Screen Replacement"],
    gallery: ["/electronics-repair-shop.png", "/tech-workspace.jpg", "/repair-tools.png"],
  },
  {
    id: 2,
    name: "Green Leaf Cafe",
    description:
      "Organic coffee shop and bakery serving locally sourced ingredients. Cozy atmosphere perfect for work or meetings. We offer free WiFi, comfortable seating, and a variety of vegan and gluten-free options.",
    image: "/cozy-coffee-shop.png",
    category: "Food & Beverage",
    address: "456 Oak Avenue",
    city: "San Francisco, CA",
    phone: "(555) 234-5678",
    email: "hello@greenleafcafe.com",
    website: "greenleafcafe.com",
    rating: 4.9,
    reviews: 512,
    hours: "Daily: 7AM-8PM",
    owner: "sarahbaker",
    ownerAvatar: "/professional-woman-baker.jpg",
    ownerType: "individual",
    verified: false,
    yearEstablished: "2020",
    employees: "3-5",
    services: ["Coffee & Espresso", "Fresh Bakery", "Breakfast & Lunch", "Catering", "Event Space"],
    gallery: ["/cozy-coffee-shop.png", "/coffee-beans.jpg", "/pastries.png"],
  },
  {
    id: 3,
    name: "FitZone Gym",
    description:
      "State-of-the-art fitness center with personal trainers, group classes, and modern equipment. First week free! Comprehensive fitness programs for all levels.",
    image: "/modern-gym-equipment.png",
    category: "Health & Fitness",
    address: "789 Fitness Boulevard",
    city: "San Francisco, CA",
    phone: "(555) 345-6789",
    email: "info@fitzonegym.com",
    website: "fitzonegym.com",
    rating: 4.7,
    reviews: 356,
    hours: "24/7 Access",
    owner: "FitZone Inc",
    ownerAvatar: "/fitness-company-logo.jpg",
    ownerType: "institution",
    verified: true,
    yearEstablished: "2019",
    employees: "15-25",
    services: ["Personal Training", "Group Classes", "Equipment Access", "Nutrition Counseling", "Locker Rooms"],
    gallery: ["/modern-gym-equipment.png", "/group-fitness.jpg", "/personal-training.png"],
  },
  {
    id: 4,
    name: "Artisan Bookshop",
    description:
      "Independent bookstore featuring curated collections, rare finds, and local author events. Community reading space available. A haven for book lovers and literary enthusiasts.",
    image: "/cozy-bookstore-interior.jpg",
    category: "Retail",
    address: "321 Book Lane",
    city: "San Francisco, CA",
    phone: "(555) 456-7890",
    email: "books@artisanbookshop.com",
    website: "artisanbookshop.com",
    rating: 4.9,
    reviews: 189,
    hours: "Mon-Sun: 10AM-7PM",
    owner: "bookworm_jen",
    ownerAvatar: "/woman-with-glasses-reading.jpg",
    ownerType: "individual",
    verified: false,
    yearEstablished: "2017",
    employees: "2-5",
    services: ["Book Sales", "Rare Books", "Author Events", "Reading Groups", "Book Recommendations"],
    gallery: ["/cozy-bookstore-interior.jpg", "/book-shelves.jpg", "/reading-nook.png"],
  },
]

const mockReviews = [
  {
    id: 1,
    author: "techguru42",
    authorAvatar: "/tech-enthusiast.png",
    rating: 5,
    date: "2024-12-28",
    content: "Excellent service! They fixed my laptop screen in just 2 hours. Highly recommend!",
    helpful: 12,
  },
  {
    id: 2,
    author: "janedoe",
    authorAvatar: "/professional-woman-diverse.png",
    rating: 5,
    date: "2024-12-15",
    content: "Very professional and affordable. Will definitely come back for future repairs.",
    helpful: 8,
  },
  {
    id: 3,
    author: "mobilefan",
    authorAvatar: "/developer-avatar.png",
    rating: 4,
    date: "2024-12-10",
    content: "Good work, though it took a bit longer than expected. Overall satisfied with the service.",
    helpful: 5,
  },
]

export default function BusinessDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const businessId = Number.parseInt(id)
  const business = mockBusinesses.find((b) => b.id === businessId) || mockBusinesses[0]

  const [activeTab, setActiveTab] = useState("about")
  const [reviewText, setReviewText] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)

  // Scroll to top when component mounts
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
    }, 100)
  }, [])

  return (
    <Layout.Main>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/businesses")} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Businesses
        </Button>

        <div className="rounded-lg border bg-card overflow-hidden">
          {/* Business Header Image */}
          <div className="relative h-64 md:h-80">
            <img src={business.image || "/placeholder.svg"} alt={business.name} className="w-full h-full object-cover" />
            {business.verified && (
              <Badge className="absolute top-4 left-4 gap-1 bg-primary">
                <CheckCircle2 className="h-3 w-3" />
                Verified Business
              </Badge>
            )}
          </div>

          {/* Business Info */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-lg font-semibold">{business.rating}</span>
                    <span className="text-muted-foreground">({business.reviews} reviews)</span>
                  </div>
                  <Badge variant="secondary">{business.category}</Badge>
                </div>
                <Link
                  to={`/profile/${business.ownerType}/${business.owner}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <img
                      src={business.ownerAvatar || "/placeholder.svg"}
                      alt={business.owner}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Owned by</span>
                    {business.ownerType === "individual" ? (
                      <User className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="font-medium">{business.owner}</span>
                    {business.ownerType === "institution" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span>
                  {business.address}, {business.city}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <a href={`tel:${business.phone}`} className="hover:text-primary">
                  {business.phone}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <a href={`mailto:${business.email}`} className="hover:text-primary">
                  {business.email}
                </a>
              </div>
              {business.website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <a
                    href={`https://${business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {business.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span>{business.hours}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
              <Button className="flex-1 gap-2">
                <Phone className="h-4 w-4" />
                Contact Business
              </Button>
              <Button variant="outline" className="flex-1 gap-2 bg-transparent">
                <MessageCircle className="h-4 w-4" />
                Send Message
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{business.yearEstablished}</div>
                <div className="text-xs text-muted-foreground">Established</div>
              </div>
              <div className="text-center border-x">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{business.employees}</div>
                <div className="text-xs text-muted-foreground">Employees</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{business.reviews}</div>
                <div className="text-xs text-muted-foreground">Reviews</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b mb-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("about")}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === "about" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  About
                  {activeTab === "about" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button
                  onClick={() => setActiveTab("services")}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === "services" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Services
                  {activeTab === "services" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === "reviews" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Reviews ({business.reviews})
                  {activeTab === "reviews" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">About this business</h3>
                  <p className="text-muted-foreground leading-relaxed">{business.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Gallery</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {business.gallery.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "services" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Our Services</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {business.services.map((service, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="font-medium">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Write Review */}
                <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                  <h3 className="font-semibold">Write a review</h3>
                  <Textarea
                    placeholder="Share your experience with this business..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="hover:scale-110 transition-transform">
                          <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                        </button>
                      ))}
                    </div>
                    <Button disabled={!reviewText.trim()}>Post Review</Button>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="flex gap-3 p-4 rounded-lg border">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={review.authorAvatar || "/placeholder.svg"}
                          alt={review.author}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold">{review.author}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? "fill-yellow-500 text-yellow-500"
                                        : "fill-muted text-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span>·</span>
                              <span>
                                {new Date(review.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed mb-3">{review.content}</p>
                        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
                          Helpful ({review.helpful})
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout.Main>
  )
}