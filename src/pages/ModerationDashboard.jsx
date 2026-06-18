import { ShieldCheck, ShieldAlert, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/*
To implement a
Moderation Log, we need a dedicated table to track every AI decision and a way for Admins to "Override" those decisions. In a standalone app, this
 creates a clear audit trail and allows human oversight for "False Positives" (where the AI was wrong).
*/

/*
This component allows admins to see a list of "Rejected" images and click "Approve" 
if the AI made a mistake.
*/

export function ModerationDashboard({ flaggedComments }) {
  const handleOverride = async (id: number, status: string) => {
    const reason = window.prompt("Why are you overriding this AI decision?");
    if (!reason) return;

    await fetch(`/api/admin/moderation/override`, {
      method: "POST",
      body: JSON.stringify({ comment_id: id, status, reason }),
      headers: { "Content-Type": "application/json" }
    });
  };

  return (
    <Card>
      <CardHeader><CardTitle>AI Moderation Log</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>AI Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flaggedComments.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <img src={c.image_url} className="w-16 h-16 object-cover rounded blur-[2px] hover:blur-0 transition-all" />
                </TableCell>
                <TableCell>
                  <Badge variant={c.moderation_status === "rejected" ? "destructive" : "outline"}>
                    {c.moderation_status}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOverride(c.id, "approved")}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleOverride(c.id, "rejected")}>
                    <ShieldAlert className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/*
Why this is the "Golden Path":

    Auditability: If a user complains "Why was my photo removed?", the admin can check the moderation_logs and see exactly which AI model flagged it or which admin rejected it manually.
    Safety: The blur-[2px] hover:blur-0 on the admin dashboard ensures the admin isn't hit with offensive content immediately, but can still inspect it.
    Real-time: Using the image_moderated broadcast ensures that as soon as the admin clicks "Approve," the image unblurs for all users currently in that event chat via Phoenix Channels.
*/

/*
Summary of the "Override" Flow:

    AI rejects a photo (nudity detected).
    Admin sees it's actually just a photo of a desert (False Positive).
    Admin clicks "Approve" + enters reason: "Not nudity, just sand."
    Database updates comment status and creates a ModerationLog.
    WebSocket tells the chat to show the image clearly.
*/