// #User Muting

import { VolumeX } from "lucide-react";

export function PostActions({ author }) {
  const handleMute = async () => {
    await fetch(`/api/users/${author.id}/mute`, { method: "POST" });
    
    // 5. OPTIMISTIC UI: Remove all posts by this user from the local feed
    setPosts(prev => prev.filter(p => p.user_id !== author.id));
    
    toast({ title: `You muted @${author.username}`, description: "You will no longer see their posts." });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>...</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleMute} className="text-red-600">
          <VolumeX className="mr-2 h-4 w-4" /> Mute @{author.username}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/*
Why this is the "Golden Path" for Standalone:

    Privacy Control: It gives users the power to curate their own experience without requiring admin intervention.
    Performance: By fetching muted_ids first and using a not in clause, Postgres can utilize its indexes to skip unwanted rows efficiently Ecto.Query.where/3 documentation.
    Silent Action: Unlike a block, the muted user is never notified. They can still follow the muter, keeping the social graph intact but "silent."
*/
/*
Summary of the Flow:

    User A mutes User B.
    React instantly filters out User B's posts from the current view.
    Elixir saves the relationship in the mutes table.
    Database ensures future timeline requests exclude User B's content for User A.
*/
