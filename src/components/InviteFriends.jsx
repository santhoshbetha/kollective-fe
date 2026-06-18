import { useState } from "react"
import { Check, Plus, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function InviteFriends({ eventId, friends }) {
  const [invitedIds, setInvitedIds] = useState<number[]>([])

  const handleInvite = async (userId: number) => {
    // 1. Optimistic UI
    setInvitedIds((prev) => [...prev, userId])
    
    // 2. Backend Call: POST /api/events/:id/invite
    await fetch(`/api/events/${eventId}/invite`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
      headers: { "Content-Type": "application/json" }
    })
  }

   //tcheck later
   //In your Shadcn component, the handleInvite function will now point to this specific endpoint.
  const handleInvite2 = async (targetUserId) => {
  try {
    const response = await fetch(`/api/events/${eventId}/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}` // If using JWT
      },
      body: JSON.stringify({ user_id: targetUserId })
    });

    if (response.ok) {
      setInvitedIds((prev) => [...prev, targetUserId]);
      toast({ title: "Invited!", description: "They received a notification." });
    }
  } catch (error) {
    toast({ variant: "destructive", title: "Error", description: "Failed to send invite." });
  }
};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" /> Invite Friends
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search friends..." className="pl-8" />
        </div>
        <ScrollArea className="mt-4 h-[300px] pr-4">
          <div className="space-y-4">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={friend.avatar_url} />
                    <AvatarFallback>{friend.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{friend.username}</p>
                    <p className="text-xs text-muted-foreground">@{friend.handle}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={invitedIds.includes(friend.id) ? "ghost" : "secondary"}
                  disabled={invitedIds.includes(friend.id)}
                  onClick={() => handleInvite(friend.id)}
                >
                  {invitedIds.includes(friend.id) ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}


/*
Why this is the "Golden Path":

    Permission Check: By putting can_invite? in the controller, you prevent malicious users from "spamming" invites to events they don't own.
    Explicit Errors: If the invite fails (e.g., the user is already invited), the backend returns a 422 Unprocessable Entity, allowing the React app to show a helpful error message.
    Clean JSON: The render("success.json") ensures your frontend gets a predictable response to update its local state (turning that "Plus" icon into a "Check").

    React Dialog → Phoenix Controller → Events Context → Notifications Logic → Database/Websocket Push.
*/