import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import Layout from '../components/Layout'
import { Calendar, MapPin, Users, Video, ImageIcon, ArrowLeft, Clock, Sparkles, CheckCircle2, CalendarDays } from "lucide-react"

const CreateEventPage = () => {
  const navigate = useNavigate()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventType, setEventType] = useState("in-person")
  const [category, setCategory] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [location, setLocation] = useState("")
  const [capacity, setCapacity] = useState("")
  const [coverImage, setCoverImage] = useState(null) // eslint-disable-line no-unused-vars
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)

  const startCalendarRef = useRef(null)
  const endCalendarRef = useRef(null)

  // Close calendars when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideStartCalendar = startCalendarRef.current && !startCalendarRef.current.contains(event.target)
      const isOutsideEndCalendar = endCalendarRef.current && !endCalendarRef.current.contains(event.target)

      // Close start calendar if click is outside
      if (isOutsideStartCalendar) {
        setShowStartCalendar(false)
      }

      // Close end calendar if click is outside
      if (isOutsideEndCalendar) {
        setShowEndCalendar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const categories = [
    "Technology",
    "Education",
    "Business",
    "Environment",
    "Arts",
    "Finance",
    "Health",
    "Gaming",
    "Sports",
    "Music",
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Event created:", {
      title,
      description,
      eventType,
      category,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      capacity,
      coverImage,
    })
    // Navigate back to events page
    navigate("/events")
  }

  return (
    <Layout.Main>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="relative">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/events")} 
            className="gap-2 mb-4 hover:bg-primary/10 hover:text-primary transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Create New Event
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Share Your Event
            </h1>
            <p className="text-muted-foreground text-lg">
              Bring your community together and create memorable experiences
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Image Card */}
          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors duration-300">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Event Cover Image</h3>
              <p className="text-muted-foreground mb-4">
                Upload a stunning image to attract attendees
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Recommended size: 1200×630px • Max file size: 5MB
              </p>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                className="hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            </CardContent>
          </Card>

          {/* Basic Information Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Event Title <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Enter a compelling event title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="text-lg h-12 focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  Make it descriptive and engaging to attract attendees
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Description <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="Describe your event in detail. What will attendees experience? What should they expect?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={6}
                  className="resize-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Be specific about the agenda, speakers, and what makes this event unique
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {description.length}/2000
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Event Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Event Type <span className="text-destructive">*</span>
                  </label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="h-12 focus:ring-2 focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">In-Person</div>
                            <div className="text-xs text-muted-foreground">Physical venue</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="online">
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Video className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">Online</div>
                            <div className="text-xs text-muted-foreground">Virtual event</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {cat}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Date & Time
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set when your event will take place
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Start Date & Time */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Start Date & Time
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Date
                    </label>
                    <div className="relative">
                      <Input 
                        type="text" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        required 
                        className="h-10 focus:ring-2 focus:ring-primary/20 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-primary/10"
                        onClick={() => {
                          setShowStartCalendar(!showStartCalendar)
                          setShowEndCalendar(false) // Close end calendar when opening start
                        }}
                      >
                        <CalendarDays className="h-4 w-4" />
                      </Button>
                    </div>
                    {showStartCalendar && (
                      <div ref={startCalendarRef} className="absolute z-50 mt-1">
                        <CalendarComponent
                          selectedDate={startDate ? new Date(startDate) : null}
                          onDateSelect={(date) => {
                            setStartDate(date.toISOString().split('T')[0])
                            setShowStartCalendar(false)
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Time
                    </label>
                    <Input 
                      type="time" 
                      value={startTime} 
                      onChange={(e) => setStartTime(e.target.value)} 
                      required 
                      className="h-10 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* End Date & Time */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  End Date & Time
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Date
                    </label>
                    <div className="relative">
                      <Input 
                        type="text" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        required 
                        className="h-10 focus:ring-2 focus:ring-primary/20 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-primary/10"
                        onClick={() => {
                          setShowEndCalendar(!showEndCalendar)
                          setShowStartCalendar(false) // Close start calendar when opening end
                        }}
                      >
                        <CalendarDays className="h-4 w-4" />
                      </Button>
                    </div>
                    {showEndCalendar && (
                      <div ref={endCalendarRef} className="absolute z-50 mt-1">
                        <CalendarComponent
                          selectedDate={endDate ? new Date(endDate) : null}
                          onDateSelect={(date) => {
                            setEndDate(date.toISOString().split('T')[0])
                            setShowEndCalendar(false)
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Time
                    </label>
                    <Input 
                      type="time" 
                      value={endTime} 
                      onChange={(e) => setEndTime(e.target.value)} 
                      required 
                      className="h-10 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Capacity Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {eventType === "online" ? (
                  <Video className="h-5 w-5 text-primary" />
                ) : (
                  <MapPin className="h-5 w-5 text-primary" />
                )}
                Location & Capacity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  {eventType === "online" ? "Meeting Link" : "Venue Location"} 
                  <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {eventType === "online" ? (
                      <Video className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    placeholder={
                      eventType === "online" 
                        ? "Enter Zoom, Teams, or other meeting link" 
                        : "Enter venue address or location details"
                    }
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="pl-10 h-12 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {eventType === "online" 
                    ? "Make sure the link is accessible and share any meeting details" 
                    : "Include specific address, room number, or directions if needed"
                  }
                </p>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Maximum Attendees
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    min="1"
                    className="pl-10 h-12 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Set a limit to manage capacity or leave empty for unlimited attendees
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/events")}
                  className="hover:bg-muted transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={!title || !description || !category || !startDate || !location}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
              
              {/* Form validation summary */}
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {!title || !description || !category || !startDate || !location ? (
                    <span className="text-orange-600">Please fill in all required fields to create your event</span>
                  ) : (
                    <span className="text-green-600 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Ready to create your event!
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout.Main>
  )
}

export default CreateEventPage