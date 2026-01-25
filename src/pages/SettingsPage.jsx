import { useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { User, Bell, Lock, Palette, MapPin, ChevronRight } from "lucide-react"

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
  California: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Fresno", "Oakland"],
  "New York": ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany", "Yonkers"],
  Texas: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington"],
  Florida: ["Miami", "Orlando", "Tampa", "Jacksonville", "St. Petersburg", "Tallahassee"],
  Illinois: ["Chicago", "Aurora", "Naperville", "Rockford", "Joliet", "Springfield"],
  Pennsylvania: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton"],
  Ohio: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton"],
  Georgia: ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "Macon"],
  "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville"],
  Michigan: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing"],
}

export default function SettingsPage() {
  const [userState, setUserState] = useState("")
  const [userCity, setUserCity] = useState("")
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    comments: true,
  })
  const [privacy, setPrivacy] = useState({
    private: false,
    twoFactor: false,
  })
  const [appearance, setAppearance] = useState({
    darkMode: true,
  })

  const availableCities = userState && CITIES_BY_STATE[userState] ? CITIES_BY_STATE[userState] : []

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({ ...prev, [key]: value }))
  }

  const handleAppearanceChange = (key, value) => {
    setAppearance(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Layout.Main>
      <div className="max-w-4xl">
        <div className="rounded-lg border bg-card">
          <div className="border-b p-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
          </div>

              <div className="p-6 space-y-6">
                <Link to="/profile/edit">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">Edit Profile</p>
                        <p className="text-sm text-muted-foreground">
                          Update your profile picture, banner, and personal information
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>

                <hr className="border-border" />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Location</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label htmlFor="state" className="text-sm font-medium">State</label>
                      <select
                        id="state"
                        value={userState}
                        onChange={(e) => {
                          setUserState(e.target.value)
                          setUserCity("") // Reset city when state changes
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Select your state</option>
                        {US_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="city" className="text-sm font-medium">City</label>
                      <select
                        id="city"
                        value={userCity}
                        onChange={(e) => setUserCity(e.target.value)}
                        disabled={!userState || availableCities.length === 0}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                      >
                        <option value="">{userState ? "Select your city" : "Select a state first"}</option>
                        {availableCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                {userState && userCity && (
                  <>
                    <hr className="border-border my-4" />
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">Legislative Districts</p>
                      <div className="grid gap-2">
                        <label htmlFor="congressional-district" className="text-sm font-medium">Congressional District</label>
                        <Input id="congressional-district" placeholder="Enter congressional district (e.g., 12)" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="state-senate-district" className="text-sm font-medium">State Senate District</label>
                        <Input id="state-senate-district" placeholder="Enter state senate district (e.g., 5)" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="state-house-district" className="text-sm font-medium">State House District</label>
                        <Input id="state-house-district" placeholder="Enter state house district (e.g., 23)" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="push-notifications" className="text-sm font-medium">Push Notifications</label>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                  </div>
                  <input
                    type="checkbox"
                    id="push-notifications"
                    checked={notifications.push}
                    onChange={(e) => handleNotificationChange('push', e.target.checked)}
                    className="h-6 w-6 rounded border border-input"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="email-notifications" className="text-sm font-medium">Email Notifications</label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    id="email-notifications"
                    checked={notifications.email}
                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                    className="h-6 w-6 rounded border border-input"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="comment-notifications" className="text-sm font-medium">Comment Replies</label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone replies to your comment
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="comment-notifications"
                    checked={notifications.comments}
                    onChange={(e) => handleNotificationChange('comments', e.target.checked)}
                    className="h-6 w-6 rounded border border-input"
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Privacy & Security</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="private-profile" className="text-sm font-medium">Private Profile</label>
                    <p className="text-sm text-muted-foreground">Only approved followers can see your posts</p>
                  </div>
                  <input
                    type="checkbox"
                    id="private-profile"
                    checked={privacy.private}
                    onChange={(e) => handlePrivacyChange('private', e.target.checked)}
                    className="h-6 w-6 rounded border border-input"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="two-factor" className="text-sm font-medium">Two-Factor Authentication</label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <input
                    type="checkbox"
                    id="two-factor"
                    checked={privacy.twoFactor}
                    onChange={(e) => handlePrivacyChange('twoFactor', e.target.checked)}
                    className="h-6 w-6 rounded border border-input"
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Appearance</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="dark-mode" className="text-sm font-medium">Dark Mode</label>
                    <p className="text-sm text-muted-foreground">Use dark theme across the app</p>
                  </div>
                  <input
                    type="checkbox"
                    id="dark-mode"
                    checked={appearance.darkMode}
                    onChange={(e) => handleAppearanceChange('darkMode', e.target.checked)}
                    className="h-6 w-6 rounded border border-input"
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div className="flex gap-3">
              <Button>Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout.Main>
  )
}