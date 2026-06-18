import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const formSchema = z.z.object({
  name: z.string().min(2, "Name is too short"),
  description: z.string().min(10, "Tell us more about the event"),
  start_time: z.date({ required_error: "When does it start?" }),
  join_mode: z.enum(["free", "restricted"]),
  max_participants: z.number().min(1).default(50),
})

//This form handles the name, description, join_mode, and the critical start_time using a date picker.

export function EventForm() {
  // React: Auto-Detect Timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //// Returns e.g., "Asia/Kolkata"

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
        join_mode: "free", 
        max_participants: 50,
        timezone: userTimezone // Set the detected timezone here
    },
  })

  async function onSubmit(values) {
    // Send to your Elixir Phoenix API
    // values.start_time.toISOString() ensures Elixir receives valid UTC
    await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl><Input placeholder="Summer Hackathon" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Event Timezone</FormLabel>
                <FormControl>
                    <Input {...field} readOnly className="bg-slate-50" />
                </FormControl>
                <p className="text-[10px] text-muted-foreground">
                    Detected based on your current location.
                </p>
                </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date & Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="join_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Join Mode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="free">Free Join</SelectItem>
                    <SelectItem value="restricted">Approval Required</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="max_participants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">Create Event</Button>
      </form>
    </Form>
  )
}

/*

#automate timezone detection
The Hidden or Editable Field
You should include this in your form so the backend receives it. You can either
 hide it or let the user change it (if they are planning an event for a different city).

 below is included above:

 <FormField
  control={form.control}
  name="timezone"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Event Timezone</FormLabel>
      <FormControl>
        <Input {...field} readOnly className="bg-slate-50" />
      </FormControl>
      <p className="text-[10px] text-muted-foreground">
        Detected based on your current location.
      </p>
    </FormItem>
  )}
/>

3. Elixir Backend: Using the Timezone
When the POST request hits your controller, the timezone string is saved into the database. Now, your Tz library will use that string to handle the logic.
In your EventJSON (for the frontend to show the time correctly):

defp format_local(event) do
  # This works for India (UTC+5:30), Nepal (UTC+5:45), or Europe
  event.start_time
  |> DateTime.shift_zone!(event.timezone) 
  |> Calendar.strftime("%A, %d %B %Y at %I:%M %p")
end

4. Why this is the "Golden Path" for Global Apps:

    Browser Precision: Intl.DateTimeFormat() is much more reliable than trying to calculate offsets manually (which fail during Daylight Savings).
    UTC Storage: Because your Ecto Schema uses utc_datetime, Postgres keeps everything in a single global timeline, making "Upcoming Events" queries simple.
    Local Context: Storing the string Asia/Kolkata means that even if India changes its timezone laws in 5 years, the Tz database will update, and your old events will still show the correct historical local time.


    Pro-Tip: If you want to support a "Global Feed," you can use the user's own timezone to show them when the event 
    starts for them (e.g., "Starts at 4:30 AM your time")
*/
