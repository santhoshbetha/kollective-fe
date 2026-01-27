import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { ArrowLeft, Camera, Upload, User, Info, Globe, MapPin, Mail, Edit3, AtSign, Phone, FileText } from "lucide-react"

export default function EditProfilePage() {
  const navigate = useNavigate()
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=128&width=128")
  const [bannerImage, setBannerImage] = useState("/placeholder.svg?height=200&width=800")
  const [displayName, setDisplayName] = useState("John Doe")
  const [username, setUsername] = useState("johndoe")
  const [email, setEmail] = useState("john.doe@example.com")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [bio, setBio] = useState("")

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Layout.Main>
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        
        {/* Enhanced Header with Gradient */}
        <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-primary/20 via-primary/10 to-accent/20 p-8 mb-8 border border-primary/20">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold mb-3 bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Customize your profile to express yourself and connect with the community
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <form className="space-y-8">
            {/* Profile Images Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Profile Images</h3>
              </div>

              {/* Banner Image Upload */}
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Profile Banner
                </Label>
                <p className="text-sm text-muted-foreground mb-3">Recommended size: 1500x500px • Max file size: 5MB</p>
                <div className="relative h-48 rounded-xl overflow-hidden bg-muted border-2 border-dashed border-primary/20 group hover:border-primary/30 transition-colors">
                  <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label
                      htmlFor="banner-upload"
                      className="cursor-pointer bg-background/90 hover:bg-background px-6 py-3 rounded-lg flex items-center gap-2 border border-primary/20"
                    >
                      <Upload className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Change Banner</span>
                    </label>
                    <input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerImageChange}
                    />
                  </div>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Profile Picture
                </Label>
                <p className="text-sm text-muted-foreground mb-3">Recommended size: 400x400px • Max file size: 2MB</p>
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                      <AvatarImage src={profileImage} alt="Profile" />
                      <AvatarFallback className="text-3xl bg-primary/10">U</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-2 border-white/20">
                      <label htmlFor="profile-upload" className="cursor-pointer p-2">
                        <Camera className="h-8 w-8 text-white" />
                      </label>
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label
                      htmlFor="profile-upload"
                      className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 py-2 cursor-pointer transition-colors border border-primary/20"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Photo
                    </label>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max 2MB)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Profile Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="h-12 text-base border-primary/20 focus:border-primary"
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-base font-semibold flex items-center gap-2">
                    <AtSign className="h-4 w-4 text-primary" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    className="h-12 text-base border-primary/20 focus:border-primary"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="h-12 text-base border-primary/20 focus:border-primary"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-12 text-base border-primary/20 focus:border-primary"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="h-12 text-base border-primary/20 focus:border-primary"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-base font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="h-12 text-base border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-32 text-base border-primary/20 focus:border-primary resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-primary/10">
              <Button className="flex-1 h-12 text-base font-semibold bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Edit3 className="h-5 w-5 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1 h-12 text-base font-semibold border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout.Main>
  )
}