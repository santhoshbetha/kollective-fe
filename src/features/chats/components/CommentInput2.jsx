import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/*
add a "Retry" button in React so users
 can resume a failed upload without re-typing their comment, or move on to Direct Messaging
*/

/*
Since re-typing a long comment because a 10MB upload failed is a major pain point, let's implement the
Retry logic first. This keeps the "Pending" comment in the state and allows the user to re-trigger the Cloudflare R2 upload without starting over.
*/

/*
In your Shadcn input, we store the pendingCommentId. If the upload fails, 
we show a Retry Button that calls the same logic again using that saved ID.
*/

export function CommentInput({ channel, eventId }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const { uploadFile, progress, error, setError } = useFileUpload();

  const startFlow = async () => {
    // 1. Create the 'is_published: false' record
    channel.push("start_upload_comment", { content: text, image_url: file?.name })
      .receive("ok", ({ comment_id }) => {
        setPendingId(comment_id);
        performUpload(comment_id);
      });
  };

  const performUpload = async (commentId) => {
    if (!file) return;
    try {
      const res = await fetch(`/api/events/${eventId}/upload-url?filename=${file.name}`);
      const { upload_url } = await res.json();

      await uploadFile(upload_url, file);

      // SUCCESS: Confirm to broadcast
      channel.push("confirm_upload", { comment_id: commentId });
      resetForm();
    } catch (err) {
      // Form stays populated, error state is set via hook
    }
  };

  return (
    <div className="space-y-2 p-4 border-t">
      {error && (
        <Alert variant="destructive" className="flex items-center justify-between py-2">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => performUpload(pendingId)}>
            <RefreshCw className="mr-2 h-3 w-3" /> Retry
          </Button>
        </Alert>
      )}

      {/* Standard Input UI here... */}
    </div>
  );
}

/*
Why this is the "Golden Path":

    User Experience: The user's text remains in the Textarea and the file remains in the file state. They don't lose work if the elevator goes between floors.
    Database Efficiency: We don't create a new comment on retry; we reuse the pendingId created in the first step.
    Network Resilience: Since Cloudflare R2 handles PUT requests, a retry simply overwrites the partial file at the same address, saving storage space.

Summary of the "Retry" Sequence:

    User hits send; upload fails at 45% due to Wi-Fi drop.
    UI shows a Red Alert with a "Retry" button.
    User clicks "Retry".
    React calls performUpload using the existing pendingId.
    R2 receives the full file; Phoenix broadcasts the message.
*/
