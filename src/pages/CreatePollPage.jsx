import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { ArrowLeft, Plus, X, BarChart3, Clock, HelpCircle } from "lucide-react"

export default function CreatePollPage() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [duration, setDuration] = useState("7")
  const [category, setCategory] = useState("")

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle poll creation
    console.log({ question, options, duration, category })
    navigate("/polls")
  }

  return (
    <Layout.Main>
      <div className="mb-8">
        <Link
          to="/polls"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Polls
        </Link>

        {/* Enhanced Header with Gradient */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 p-8 mb-8 border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Create a Poll
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Ask a question and let the community decide
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Poll Question Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Poll Question</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question" className="text-base font-semibold flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  Question *
                </Label>
                <Textarea
                  id="question"
                  placeholder="What would you like to ask?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-24 text-base border-primary/20 focus:border-primary resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">Be clear and specific to get better responses</p>
              </div>
            </div>

            {/* Poll Options Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Poll Options</h3>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Options *</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="h-12 text-base border-primary/20 focus:border-primary"
                        required
                      />
                    </div>
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="h-12 w-12 border-primary/20 hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}

                {options.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="w-full h-12 gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/30 transition-colors"
                  >
                    <Plus className="h-5 w-5 text-primary" />
                    Add Option
                  </Button>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Minimum 2 options, maximum 6 options</span>
                  <span>{options.length}/6 options</span>
                </div>
              </div>
            </div>

            {/* Poll Settings Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Poll Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Poll Duration *
                  </Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="h-12 border-primary/20 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">How long should the poll run?</p>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Category *
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 border-primary/20 focus:border-primary">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="politics">Politics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Choose the most relevant category</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-primary/10">
              <Button
                type="submit"
                className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Create Poll
              </Button>
              <Button
                type="button"
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