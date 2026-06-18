// "Image Moderation" (AI scanning)

/*
1. The Strategy: "Blur and Scan"
Instead of blocking the upload, use an "Optimistic" but safe UI:

    React: Upload directly to R2 and send the final_asset_url to Elixir.
    Elixir: Create the comment but set a database flag moderation_status: "pending".
    Oban: A background job picks up the image, sends it to an AI API (like Sightengine or Amazon Rekognition), and updates the status.
    React: Displays a blurred placeholder while pending and the real image only when approved.
*/

export function ModeratedImage({ comment, currentUser }) {
  const [status, setStatus] = useState(comment.moderation_status);

  // Listen for the "image_moderated" signal from the Phoenix Channel
  useEffect(() => {
    channel.on("image_moderated", (payload) => {
      if (payload.id === comment.id) setStatus(payload.status);
    });
  }, [comment.id]);

  // Shadow ban
  // If I am the author, I see it as "approved" even if the DB says "rejected"
  // (This is the 'Shadow' part of the ban)
  const displayStatus = (comment.user_id === currentUser.id && comment.moderation_status === "rejected") 
    ? "approved" 
    : comment.moderation_status;


  if (displayStatus === "rejected") {
    return <div className="p-4 bg-red-50 text-red-500 text-xs border rounded-lg">Image removed (Violates guidelines)</div>;
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      <img
        src={comment.image_url}
        className={cn(
          "transition-all duration-500",
          status === "pending" && "blur-2xl grayscale scale-110",
          status === "approved" && "blur-0 grayscale-0 scale-100"
        )}
      />
      {status === "pending" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-[10px] font-bold uppercase tracking-wider">
          Scanning...
        </div>
      )}
    </div>
  );
}

/*
Why this is the "Golden Path":

    Security: Offensive images are never shown clearly, even for a split second.
    Performance: The user can continue chatting immediately after uploading; the "heavy lifting" happens in the background via Oban.
    Cost-Effective: By using confidence thresholds (e.g., nudity > 0.95), you only block clear violations and can flag "borderline" cases for human review.

    Pro-Tip: If using Cloudinary as your proxy, they have a built-in Amazon Rekognition add-on that can handle moderation automatically during the upload call.

    */