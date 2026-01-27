import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { MapPin, Phone, Globe, Clock, ImageIcon, ArrowLeft, DollarSign, Users, Mail, X, Building2, Lightbulb, Upload, Info, Tag, FileText, Settings, Calendar, Star, Plus } from "lucide-react"

export default function PostBusinessPage() {
  const [postType, setPostType] = useState("business")
  const navigate = useNavigate()

  // Business form state
  const [businessName, setBusinessName] = useState("")
  const [businessDescription, setBusinessDescription] = useState("")
  const [category, setCategory] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [website, setWebsite] = useState("")
  const [hours, setHours] = useState("")
  const [yearEstablished, setYearEstablished] = useState("")
  const [employees, setEmployees] = useState("")
  const [services, setServices] = useState([])
  const [serviceInput, setServiceInput] = useState("")

  // Proposal form state
  const [proposalTitle, setProposalTitle] = useState("")
  const [proposalDescription, setProposalDescription] = useState("")
  const [proposalCategory, setProposalCategory] = useState("")
  const [investmentMin, setInvestmentMin] = useState("")
  const [investmentMax, setInvestmentMax] = useState("")
  const [location, setLocation] = useState("")

  const categories = [
    "Technology",
    "Food & Beverage",
    "Health & Fitness",
    "Retail",
    "Services",
    "Real Estate",
    "Manufacturing",
    "Education",
    "Entertainment",
  ]

  const addService = () => {
    if (serviceInput.trim() && !services.includes(serviceInput.trim())) {
      setServices([...services, serviceInput.trim()])
      setServiceInput("")
    }
  }

  const removeService = (service) => {
    setServices(services.filter((s) => s !== service))
  }

  const handleBusinessSubmit = (e) => {
    e.preventDefault()
    console.log("Business posted:", {
      businessName,
      businessDescription,
      category,
      address,
      city,
      phone,
      email,
      website,
      hours,
      yearEstablished,
      employees,
      services,
    })
    navigate("/businesses")
  }

  const handleProposalSubmit = (e) => {
    e.preventDefault()
    console.log("Proposal posted:", {
      proposalTitle,
      proposalDescription,
      proposalCategory,
      investmentMin,
      investmentMax,
      location,
    })
    navigate("/businesses")
  }

  return (
    <Layout.Main>
      <div className="mb-8">
        <Link
          to="/businesses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Businesses
        </Link>
        
        {/* Enhanced Header with Gradient */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 p-8 mb-8 border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Post to Community
            </h1>
            <p className="text-muted-foreground text-lg">
              Share your business or proposal with the community and connect with potential partners
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs value={postType} onValueChange={setPostType} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-card border border-border">
            <TabsTrigger 
              value="business" 
              className="text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Post Business
            </TabsTrigger>
            <TabsTrigger 
              value="proposal" 
              className="text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Post Proposal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <form onSubmit={handleBusinessSubmit} className="space-y-8">
                {/* Image Upload Section */}
                <div className="border-2 border-dashed border-primary/20 rounded-xl p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5 hover:border-primary/30 transition-colors">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium mb-2 text-foreground">Upload Business Image</p>
                  <p className="text-sm text-muted-foreground mb-4">Showcase your business with a professional photo</p>
                  <p className="text-xs text-muted-foreground mb-6">Recommended size: 1200x800px • Max 5MB</p>
                  <Button type="button" variant="outline" size="lg" className="border-primary/20 hover:border-primary/40">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                </div>

                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Basic Information</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Business Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Enter your business name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Category <span className="text-destructive">*</span>
                      </label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Description <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      placeholder="Describe your business, what you offer, and what makes you unique..."
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      required
                      rows={5}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Contact Information</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Address <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Street address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        City, State <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="e.g., San Francisco, CA"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="contact@yourbusiness.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        Phone <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="(555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        Website <span className="text-muted-foreground">(Optional)</span>
                      </label>
                      <Input
                        placeholder="https://yourbusiness.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Business Hours <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="e.g., Mon-Fri: 9AM-5PM, Sat: 10AM-3PM"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Additional Details</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Year Established
                      </label>
                      <Input
                        placeholder="e.g., 2020"
                        value={yearEstablished}
                        onChange={(e) => setYearEstablished(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Number of Employees
                      </label>
                      <Select value={employees} onValueChange={setEmployees}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5">1-5</SelectItem>
                          <SelectItem value="5-10">5-10</SelectItem>
                          <SelectItem value="10-25">10-25</SelectItem>
                          <SelectItem value="25-50">25-50</SelectItem>
                          <SelectItem value="50+">50+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Services & Offerings
                    </label>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter a service or offering"
                        value={serviceInput}
                        onChange={(e) => setServiceInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addService()
                          }
                        }}
                        className="h-11 flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={addService}
                        className="h-11 px-6 border-primary/20 hover:border-primary/40"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {services.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {services.map((service) => (
                          <div
                            key={service}
                            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20"
                          >
                            {service}
                            <button
                              type="button"
                              onClick={() => removeService(service)}
                              className="hover:text-primary/80 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Section */}
                <div className="flex justify-end gap-4 pt-8 border-t border-border">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/businesses")}
                    className="h-12 px-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 px-8 bg-primary hover:bg-primary/90"
                    disabled={
                      !businessName ||
                      !businessDescription ||
                      !category ||
                      !address ||
                      !city ||
                      !phone ||
                      !email ||
                      !hours
                    }
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Post Business
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="proposal" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <form onSubmit={handleProposalSubmit} className="space-y-8">
              {/* Proposal Header */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Proposal Details</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Proposal Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Give your proposal a compelling title"
                    value={proposalTitle}
                    onChange={(e) => setProposalTitle(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Description <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    placeholder="Describe your business proposal in detail. What are you looking for? What value do you bring?"
                    value={proposalDescription}
                    onChange={(e) => setProposalDescription(e.target.value)}
                    required
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Category <span className="text-destructive">*</span>
                  </label>
                  <Select value={proposalCategory} onValueChange={setProposalCategory}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Investment & Location */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Investment & Location</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Investment Range <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Minimum (e.g., 10000)"
                      value={investmentMin}
                      onChange={(e) => setInvestmentMin(e.target.value)}
                      required
                      className="h-11"
                    />
                    <Input
                      placeholder="Maximum (e.g., 50000)"
                      value={investmentMax}
                      onChange={(e) => setInvestmentMax(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Enter amounts in USD without commas or symbols</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Location <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Downtown San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              {/* Collaboration Info */}
              <div className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 p-6 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Collaboration Features</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your proposal will be visible to the entire community. Interested members can show interest and discuss collaboration opportunities with you directly. Build partnerships and grow your business together.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="flex justify-end gap-4 pt-8 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/businesses")}
                  className="h-12 px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-12 px-8 bg-primary hover:bg-primary/90"
                  disabled={
                    !proposalTitle ||
                    !proposalDescription ||
                    !proposalCategory ||
                    !investmentMin ||
                    !investmentMax ||
                    !location
                  }
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Post Proposal
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </Layout.Main>
  )
}