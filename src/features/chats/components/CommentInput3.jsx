import { XCircle } from "lucide-react";


/*
Delete Input:
The Cancel Button
In your CommentInput.tsx, show a "Cancel" button next to the progress bar. 
This is essential for 10MB+ files if a user realizes they picked the wrong photo.

*/
export function CommentInput({ channel, eventId }) {
  const { uploadFile, abort, progress, isUploading } = useFileUpload();
  const [pendingId, setPendingId] = useState(null);

  const handleCancel = () => {
    // 1. Stop the browser upload to R2
    abort();

    // 2. Tell Elixir to delete the pending DB record
    if (pendingId) {
      channel.push("cancel_upload", { comment_id: pendingId });
    }

    // 3. Reset local state
    setFile(null);
    setPendingId(null);
    setIsUploading(false);
    toast({ title: "Upload cancelled" });
  };

  return (
    <div>
      {isUploading && (
        <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-md">
          <Progress value={progress} className="flex-1" />
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}
      {/* ... rest of input ... */}
    </div>
  );
}

/*
Why this is the "Golden Path":

    Saves User Data: Calling xhr.abort() stops the data transfer immediately. If a user is on a metered mobile connection, this prevents them from wasting 9MB of data on a mistake.
    Database Hygiene: Instead of waiting for the Oban Cron job to clean up the "Orphaned" upload in 2 hours, we delete it instantly.
    UX Snap: The UI clears immediately, letting the user try again with a different file without feeling "stuck."
*/

/*
Summary of the "Cancel" Flow:

    User starts a 10MB upload, sees it's the wrong photo at 20%.
    User clicks "Cancel".
    React kills the XHR connection (stopping the R2 upload).
    Phoenix deletes the hidden pending comment.
    UI resets to the empty state.
*/