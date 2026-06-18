// EventDetailsPage.tsx from AI

import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, Share2, Users, Clock, Globe } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

import { EventsMap } from "./EventsMap";
import { RSVPButtons } from "./RSVPButtons";
import { InviteFriends } from "./InviteFriends";

import { CalendarPlus } from "lucide-react";


export default function EventDetailsPage({ eventId, currentUser }) {
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // 1. Initial Fetch
    fetchEventData();

    // 2. Real-time Channel Join (Phoenix)
    const channel = socket.channel(`event:${eventId}`, {});
    channel.join();

    // Listen for RSVP count updates
    channel.on("update_rsvps", (payload) => {
      setEvent((prev) => ({ ...prev, ...payload }));
    });

    // Listen for new people joining the list
    channel.on("new_attendee", (newAttendee) => {
      setAttendees((prev) => [newAttendee, ...prev].slice(0, 10));
    });

    ///Media Gallery Moderation feature
    //Media Gallery Moderation
    // Handling the "Vanish" in Real-time
    channel.on("image_removed", (payload) => {
        setGalleryMedia((prev) => prev.filter(item => item.id !== payload.id));
        toast({ title: "Photo Removed", description: "The image has been hidden from the gallery." });
    });

    return () => channel.leave();
  }, [eventId]);

    // lib/kollective_web/frontend/pages/EventDetailsPage.tsx
    // #Event Editing feature (continution from elixir backend)
    useEffect(() => {
        // 1. Connect to the specific event channel
        const channel = socket.channel(`event:${eventId}`, {});
        
        channel.join()
            .receive("ok", () => console.log("Joined event channel"))
            .receive("error", (resp) => console.log("Join failed", resp));

        // 2. THE LISTENER GOES HERE
        channel.on("event_updated", (updatedEvent) => {
            // Update the local state so the UI reflects the new time/name immediately
            setEvent(updatedEvent);
            
            // Show a Shadcn Toast to alert the user of the change
            toast({
            title: "Event Updated",
            description: "The organizer has changed some details.",
            });
        });

        // 3. Cleanup on unmount
        return () => {
            channel.leave();
        };
    }, [eventId]);


  if (!event) return <div className="p-10 text-center">Loading event...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      {/* HEADER SECTION */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">{event.join_mode} Event</Badge>
          <span className="text-sm text-muted-foreground">• Created by @{event.user.username}</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{event.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: CONTENT */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video w-full overflow-hidden rounded-xl border bg-muted">
             <EventsMap events={[event]} center={[event.latitude, event.longitude]} />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">About this event</h2>
            <p className="text-lg leading-relaxed text-slate-600 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          <Separator />

          {/* ATTENDEES PREVIEW */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Attendees</h3>
              <span className="text-sm text-muted-foreground">{event.going} going</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {attendees.map((person) => (
                <Avatar key={person.id} className="border-2 border-background w-10 h-10">
                  <AvatarImage src={person.avatar_url} />
                  <AvatarFallback>{person.username[0]}</AvatarFallback>
                </Avatar>
              ))}
              {event.going > 10 && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  +{event.going - 10}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIONS & INFO */}
        <div className="space-y-6">
          <Card className="sticky top-6 shadow-lg border-2">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* DATE & TIME */}
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold">{format(new Date(event.start_time), "EEEE, MMMM do")}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(event.start_time), "p")} UTC</p>
                </div>
              </div>

              {/* LOCATION */}
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold">{event.location_name}</p>
                  <p className="text-sm text-muted-foreground">{event.locality}, {event.country}</p>
                  {event.location_url && (
                    <a href={event.location_url} target="_blank" className="text-xs text-blue-500 hover:underline">View on Map</a>
                  )}
                </div>
              </div>

              <Separator />

              {/* RSVP ACTION */}
              <RSVPButtons event={event} initialStatus={event.my_rsvp_status} />

              <div className="grid grid-cols-2 gap-2">
                <InviteFriends eventId={event.id} friends={[]} />
                <Button variant="outline" className="gap-2" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link Copied", description: "Share it with your friends!" });
                }}>
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>

              {/* CAPACITY PROGRESS */}
              {event.metadata?.max_participants && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Capacity</span>
                    <span>{event.going} / {event.metadata.max_participants}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all" 
                      style={{ width: `${(event.going / event.metadata.max_participants) * 100}%` }} 
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

//.ics file as a direct download when the user clicks a button in React
export function CalendarExport({ eventId }) {
  const handleDownload = () => {
    // Simply open the API endpoint in a new tab to trigger the browser download
    window.location.href = `/api/events/${eventId}/ics`;
  };

  return (
    <Button variant="outline" onClick={handleDownload} className="w-full gap-2">
      <CalendarPlus className="h-4 w-4" />
      Add to Calendar
    </Button>
  );
}

/*
#Event Editing feature (Elixir BE + React FE)
 Why this is the "Golden Path" for Global Editing:

    Job Atomicity: By canceling and re-inserting the Oban Job, you guarantee that users won't get "double pings" (one for the old time and one for the new).
    Timezone Consistency: Even if the organizer moves from London to Mumbai and changes the timezone string, Tz.shift_zone!/3 ensures the UTC start_time remains the source of truth for the database.
    User Trust: The event_time_changed notification is essential for retention; users hate missing events because the time was edited silently.

Summary of the "Edit" Sequence:

    Organizer changes time from 10 AM to 2 PM.
    Backend updates posts table.
    Oban kills the 10 AM job and creates a 2 PM job.
    Notifications sends a "Time Changed" alert to all "Going" users.
    UI updates the clock icon and date string via WebSocket.

You have now built a professional-grade Event management system. This covers the entire lifecycle: Create → Invite → Join/Waitlist → Remind → Edit → Cancel.
*/

/*

*/

/*
<div className="container grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
  <div className="md:col-span-2 space-y-6">
    <h1 className="text-4xl font-extrabold tracking-tight">{event.name}</h1>
    <EventsMap events={[event]} center={[event.latitude, event.longitude]} />
    <div className="prose max-w-none">
      <p className="text-lg leading-relaxed text-slate-700">{event.description}</p>
    </div>
  </div>
  
  <div className="space-y-6">
    <Card className="p-6 sticky top-6">
      <div className="space-y-4">
         <RSVPButtons event={event} /> 
         <InviteFriends eventId={event.id} friends={followedFriends} />
         <Separator />
         <div className="flex items-center justify-between text-sm font-medium">
           <span>Attending</span>
           <span className="text-muted-foreground">{event.participants_count}</span>
         </div>
         <AttendeeList eventId={event.id} />
      </div>
    </Card>
  </div>
</div>*/
