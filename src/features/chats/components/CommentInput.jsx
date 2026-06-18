import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/useFileUpload";

/*
add the React "Upload + Progress Bar" code to make the 10MB upload feel smooth for the user

To make a 10MB upload feel "instant," we use a
two-stage optimistic UI: first, we show the text comment immediately in a "sending" state,
 and second, we use a Shadcn/UI Progress bar to show the actual binary transfer to Cloudflare R2.

*/

export function CommentInput({ channel, eventId }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { uploadFile, progress, setProgress } = useFileUpload();
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!text && !file) return;
    setIsUploading(true);

    // 1. Tell Elixir to create a "Pending" comment
    channel.push("start_upload_comment", { 
      content: text, 
      image_url: file?.name || null 
    }).receive("ok", async ({ comment_id }) => {
      
      if (file) {
        try {
          // 2. Get Presigned URL (R2/S3)
          const res = await fetch(`/api/events/${eventId}/upload-url?filename=${file.name}`);
          const { upload_url } = await res.json();

          // 3. Upload with Progress Tracking
          await uploadFile(upload_url, file);

          // 4. Confirm to Elixir to broadcast to everyone
          channel.push("confirm_upload", { comment_id });
          
          setFile(null);
          setText("");
        } catch (err) {
          console.error("Upload failed");
        }
      } else {
        // If no file, just confirm immediately
        channel.push("confirm_upload", { comment_id });
        setText("");
      }
      
      setIsUploading(false);
      setProgress(0);
    });
  };

  return (
    <div className="space-y-4 p-4 border-t bg-white">
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Uploading photo...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}

      <div className="flex gap-2">
        <Textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="Share a photo or tip..."
        />
        <Button onClick={handleSubmit} disabled={isUploading}>
          Send
        </Button>
      </div>
    </div>
  );
}

/*
Why this is the "Golden Path" for UX:

    XHR for Progress: Unlike fetch, XMLHttpRequest gives us the upload.onprogress event, which is the only way to drive a Shadcn Progress bar accurately MDN XMLHttpRequest.upload.
    Non-Blocking: The user sees the progress bar at the top of the chat input, but they can still read other messages while the 10MB file is in flight.
    Error Prevention: By setting setIsUploading(true), we disable the "Send" button, preventing the user from accidentally double-posting or starting a second upload while the first is finishing.
*/

/*
Summary of the "Smooth" Flow:

    User clicks Send.
    UI immediately shows a 1% progress bar.
    Browser streams chunks to Cloudflare R2.
    UI updates the bar: 10%... 45%... 100%.
    Phoenix receives the "Confirm" signal and pops the image into the chat for everyone.
*/