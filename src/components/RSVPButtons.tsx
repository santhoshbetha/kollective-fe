import { useState } from "react"
import { Check, HelpCircle, X } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function RSVPButtons({ event, initialStatus }) {
  const [status, setStatus] = useState(initialStatus || "none")

  const handleRSVP = async (newStatus: string) => {
    if (!newStatus) return; // Prevent deselecting
    
    setStatus(newStatus)
    // POST /api/events/:id/rsvp
    await fetch(`/api/events/${event.id}/rsvp`, {
      method: "POST",
      body: JSON.stringify({ status: newStatus }),
      headers: { "Content-Type": "application/json" }
    })
  }

//Conflicts check merge with above later
/*
Summary of the Flow:

    Viewing (Channel Join): User enters the page. join/3 checks if it's a private event. If okay, it shows the chat. No conflict check here.
    Attending (RSVP Join): User clicks "Going." join_event/2 checks if they are busy elsewhere. If busy, it returns the error. Conflict check happens here.
*/
 const handleRSVP2 = async (status: string) => {
  const response = await fetch(`/api/events/${event.id}/join`, { ... });
  const data = await response.json();

  if (data.error) {
    // Show the "Already attending X, Y, Z" message in a Red Toast
    toast({
      variant: "destructive",
      title: "Schedule Conflict! ⚠️",
      description: data.error,
    });
  }
};

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">Are you going?</p>
      <ToggleGroup 
        type="single" 
        value={status} 
        onValueChange={handleRSVP}
        className="justify-start gap-2"
      >
        <ToggleGroupItem value="going" aria-label="Going" className="gap-2 px-4 data-[state=on]:bg-green-100 data-[state=on]:text-green-900">
          <Check className="h-4 w-4" /> Going
        </ToggleGroupItem>
        
        <ToggleGroupItem value="maybe" aria-label="Maybe" className="gap-2 px-4 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-900">
          <HelpCircle className="h-4 w-4" /> Maybe
        </ToggleGroupItem>
        
        <ToggleGroupItem value="no" aria-label="No" className="gap-2 px-4 data-[state=on]:bg-red-100 data-[state=on]:text-red-900">
          <X className="h-4 w-4" /> No
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
