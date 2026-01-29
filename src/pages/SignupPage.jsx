import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  MapPin,
  Check,
  ChevronRight,
  Building2,
  Users,
  Calendar,
  Sparkles,
  Shield,
  Globe,
  Heart,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]

const CITIES_BY_STATE = {
  California: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"],
  Texas: ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth"],
  "New York": ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"],
  Florida: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
  Illinois: ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford"],
  // Add more as needed
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)

  // Form data
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [agreedToRules, setAgreedToRules] = useState(false)
  const [birthday, setBirthday] = useState("")
  const [userType, setUserType] = useState("individual")
  const [organizationType, setOrganizationType] = useState("")

  const handleNext = (e) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = () => {
    console.log("[v0] Signup submitted:", {
      email,
      username,
      fullName,
      state,
      city,
      birthday,
      userType,
      organizationType,
    })
    // Don't redirect, just stay on confirmation page
  }

  const handleResendEmail = () => {
    console.log("[v0] Resending confirmation email to:", email)
    setResendDisabled(true)
    setTimeout(() => setResendDisabled(false), 60000) // Re-enable after 60 seconds
  }

  const getAvailableCities = () => {
    return CITIES_BY_STATE[state] || []
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Join Kollective99
            </h1>
          </div>
          <p className="text-muted-foreground text-lg" hidden>Your journey to meaningful connections starts here</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              Welcome
            </span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              Details
            </span>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              Verify
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8">
          <form onSubmit={handleNext}>
            {/* Step 1: Accept Rules */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Shield className="h-16 w-16 text-primary mx-auto mb-4" hidden/>
                  <img src="/K99.png" alt="Kollective99 Logo" className="h-18 w-20 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Welcome to Our Community</h2>
                  <p className="text-muted-foreground">
                    Before we begin, let's make sure we're on the same page about how we treat each other.
                  </p>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      icon: Heart,
                      title: "Be Kind & Respectful",
                      description: "Treat everyone with respect. No harassment, hate speech, or personal attacks.",
                    },
                    {
                      icon: Users,
                      title: "Keep it Real",
                      description: "Share authentic content and avoid excessive self-promotion or spam.",
                    },
                    {
                      icon: Shield,
                      title: "Protect Privacy",
                      description: "Respect others' personal information and don't share it without consent.",
                    },
                    {
                      icon: Globe,
                      title: "Stay Informed",
                      description: "Verify information before sharing and cite sources when possible.",
                    },
                  ].map((rule, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl border bg-linear-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-blue-200 dark:border-gray-600">
                      <div className="shrink-0">
                        <rule.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{rule.title}</h3>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border bg-linear-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreedToRules}
                    onChange={(e) => setAgreedToRules(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <Label htmlFor="agree" className="text-sm cursor-pointer leading-relaxed font-medium">
                    I agree to follow these community guidelines and help create a positive environment for everyone
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => navigate("/")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Not ready yet
                  </Button>
                  <Button type="submit" className="flex-1 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0" disabled={!agreedToRules}>
                    Let's get started!
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Your Details + Location - Combined account details and location */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <User className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
                  <p className="text-muted-foreground">
                    Choose the type of account that best fits your needs.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Account Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`relative flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${userType === "individual" ? "border-blue-500 bg-blue-50 shadow-lg" : "border-gray-200 hover:border-blue-500"}`}>
                      <input
                        type="radio"
                        name="userType"
                        value="individual"
                        checked={userType === "individual"}
                        onChange={(e) => setUserType(e.target.value)}
                        className="sr-only"
                      />
                      <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg mb-1 text-green-600">Personal Account</div>
                        <div className={`text-sm ${userType === "individual" ? "text-gray-700 dark:text-dark" : "text-muted-foreground"}`}>
                            For individuals sharing thoughts and connecting with others
                        </div>
                      </div>
                      {userType === "individual" && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </label>
                    <label className={`relative flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${userType === "organization" ? "border-green-500 bg-green-50 shadow-lg" : "border-gray-200 hover:border-green-500"}`}>
                      <input
                        type="radio"
                        name="userType"
                        value="organization"
                        checked={userType === "organization"}
                        onChange={(e) => setUserType(e.target.value)}
                        className="sr-only"
                      />
                      <div className="w-12 h-12 bg-linear-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg mb-1 text-blue-600">Organization</div>
                        <div className={`text-sm ${userType === "organization" ? "text-gray-700 dark:text-dark" : "text-muted-foreground"}`}>For businesses, news outlets, and community groups</div>
                      </div>
                      {userType === "organization" && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Account Details Section */}
                <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Account Details</h3>
                    <p className="text-sm text-muted-foreground">Fill in your information to create your profile.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name / Organization Name */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="fullName">{userType === "organization" ? "Organization Name" : "Full Name"}</Label>
                      <div className="relative">
                        {userType === "organization" ? (
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        ) : (
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        )}
                        <Input
                          id="fullName"
                          type="text"
                          placeholder={userType === "organization" ? "Acme News Corporation" : "John Doe"}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                        <Input
                          id="username"
                          type="text"
                          placeholder={userType === "organization" ? "acmenews" : "johndoe"}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-8"
                          required
                        />
                      </div>
                    </div>

                    {userType === "individual" && (
                      <div className="space-y-2">
                        <Label htmlFor="birthday">Birthday</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="birthday"
                            type="date"
                            value={birthday || (() => {
                              const seventeenYearsAgo = new Date();
                              seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
                              return seventeenYearsAgo.toISOString().split("T")[0];
                            })()}
                            onChange={(e) => setBirthday(e.target.value)}
                            className="pl-10"
                            required
                            max={(() => {
                              const seventeenYearsAgo = new Date();
                              seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
                              return seventeenYearsAgo.toISOString().split("T")[0];
                            })()}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">You must be at least 17 years old</p>
                      </div>
                    )}

                    {userType === "organization" && (
                      <div className="space-y-2">
                        <Label htmlFor="organizationType">Organization Type</Label>
                        <Select value={organizationType} onValueChange={setOrganizationType}>
                          <SelectTrigger>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Select organization type" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newspaper">Newspaper</SelectItem>
                            <SelectItem value="youtube">YouTube Channel</SelectItem>
                            <SelectItem value="journalists">Group of Journalists</SelectItem>
                            <SelectItem value="news-agency">News Agency</SelectItem>
                            <SelectItem value="media-company">Media Company</SelectItem>
                            <SelectItem value="podcast">Podcast</SelectItem>
                            <SelectItem value="blog">Blog</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Location Section */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Location</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Help us connect you with your local community.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* State */}
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Select
                          value={state}
                          onValueChange={(value) => {
                            setState(value)
                            setCity("") // Reset city when state changes
                          }}
                        >
                          <SelectTrigger>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Select state" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((stateName) => (
                              <SelectItem key={stateName} value={stateName}>
                                {stateName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* City */}
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Select value={city} onValueChange={setCity} disabled={!state}>
                          <SelectTrigger>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder={state ? "Select city" : "Select state first"} />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableCities().length > 0 ? (
                              getAvailableCities().map((cityName) => (
                                <SelectItem key={cityName} value={cityName}>
                                  {cityName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="other">Other</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button type="button" variant="outline" className="flex-1 bg-transparent border-2 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={handleBack}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                      disabled={
                        !email ||
                        !password ||
                        !confirmPassword ||
                        password !== confirmPassword ||
                        !username ||
                        !fullName ||
                        !state ||
                        !city ||
                        (userType === "individual" && !birthday) ||
                        (userType === "organization" && !organizationType)
                      }
                    >
                      Continue to Verification
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirm Email - New confirmation step */}
            {step === 3 && (
              <div className="space-y-8 text-center py-12">
                <div>
                  <div className="w-24 h-24 bg-linear-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Mail className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 bg-linear-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Almost there!
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    We've sent a confirmation link to <strong className="text-foreground font-semibold">{email}</strong>.
                    Click the link to activate your account and start your journey.
                  </p>
                </div>

                <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Email sent successfully</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The confirmation email should arrive within the next few minutes. Don't forget to check your spam folder!
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>Didn't receive the email?</span>
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={resendDisabled}
                      className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendDisabled ? "Email sent! Check your inbox" : "Send it again"}
                    </button>
                  </div>

                  <div className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Wrong email address?{" "}
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-primary hover:underline font-medium"
                    >
                      Go back to edit your details
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Your information is secure and will never be shared</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/" className="text-primary hover:underline font-medium">
            Sign in instead
          </Link>
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
    </div>
  )
}