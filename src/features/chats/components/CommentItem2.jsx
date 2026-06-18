/*
add a "Blur" effect to the thumbnail while the AI Moderation scan is happening in the background
*/
/*
To implement a
Blur Effect during the AI Moderation scan, we combine the moderation_status from our Elixir schema with Tailwind's blur utilities. This provides a "Safe Preview" where the user sees their content 
is uploaded but it remains obscured until the Oban Moderation Worker confirms it's safe.
*/
/*
1. Update the Comment Component (CommentItem.tsx)
In your TanStack Virtual list, use a conditional class based on the moderation_status we 
added to our CommentJSON
*/
import { cn } from "@/lib/utils"; // Shadcn utility
import { Loader2, ShieldCheck } from "lucide-react";

export function CommentItem({ comment }) {
  // 1. Determine if the image should be blurred
  const isScanning = comment.moderation_status === "pending";
  const isRejected = comment.moderation_status === "rejected";

  return (
    <div className="flex gap-3 p-4 border-b">
      <Avatar>...</Avatar>
      
      <div className="flex-1 space-y-2">
        <p className="text-sm">{comment.content}</p>

        {comment.image_url && (
          <div className="relative w-64 overflow-hidden rounded-lg border bg-slate-100">
            {/* 2. THE BLUR EFFECT */}
            <img
              src={comment.image_url}
              alt="Event photo"
              className={cn(
                "h-full w-full object-cover transition-all duration-700",
                isScanning && "blur-xl scale-110 grayscale", // Heavy blur while scanning
                isRejected && "opacity-0" // Hide if rejected
              )}
            />

            {/* 3. OVERLAY FOR SCANNING STATE */}
            {isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 text-white">
                <Loader2 className="h-6 w-6 animate-spin mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  AI Scanning...
                </span>
              </div>
            )}

            {isRejected && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-600 text-xs p-4 text-center">
                Image removed for safety.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
/*
2. Real-time Unblur Logic (EventComments.tsx)
When the Oban Worker finishes, it broadcasts image_moderated. Your React component catches this and updates the local state, causing the blur-xl class to disappear smoothly.

// Inside your EventComments useEffect
channel.on("image_moderated", ({ id, status }) => {
  setComments((prev) =>
    prev.map((c) => (c.id === id ? { ...c, moderation_status: status } : c))
  );
  
  if (status === "approved") {
    toast({ title: "Image Approved", description: "Your photo is now visible to everyone." });
  }
});
*/

/*
3. Why this is the "Golden Path":

    Safety First: By using blur-xl and grayscale, the image is unrecognizable. Even if a user uploads something highly offensive, the "Safe Preview" protects other attendees.
    Visual Continuity: The transition-all duration-700 makes the image "fade into focus" once approved, which feels much more premium than a sudden jump.
    User Feedback: The "Scanning..." text prevents the user from thinking the app is broken or the image didn't load correctly.
*/
/*
Summary of the "Scan & Unblur" Flow:

    User confirms upload; Elixir broadcasts comment with status: "pending".
    Attendees see a heavily blurred, gray box with a "Scanning" loader.
    Oban Worker receives the Sightengine API result.
    Elixir broadcasts status: "approved".
    React removes the blur; the image fades into full color and clarity.
*/