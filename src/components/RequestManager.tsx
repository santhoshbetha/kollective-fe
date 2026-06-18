import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RequestManager({ requests, onAction }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Pending Requests ({requests.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between border-b pb-3 last:border-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={req.user.avatar_url} />
                <AvatarFallback>{req.user.username[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">@{req.user.username}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-red-600 hover:bg-red-50"
                onClick={() => onAction(req.id, "reject")}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => onAction(req.id, "approve")}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


/*
3. Key "Standalone" Logic for Approval:

    Double Correction: Notice how approve_request increments the participants_count while simultaneously decrementing the participation_request_count. This keeps your UI badges perfectly in sync.
    Privacy: Because the user is only added to the accepted list after this action, they won't show up in the "Who's Going" list on the main page until you click the green checkmark.
    Real-time: The broadcast to user_feed:ID ensures the applicant gets a popup notification saying "Your request to join 'Hackathon' was approved!" the moment you click.

Summary of the "Request" Lifecycle:

    User clicks "Join" → Status is pending.
    Organizer sees the request in the RequestManager dashboard.
    Organizer clicks Approve → approve_request runs.
    Database promotes the user to accepted.
    User receives a real-time notification and now sees "Going ✓" on the event page.
*/