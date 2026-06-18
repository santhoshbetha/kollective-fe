/*
  #To prevent users from seeing raw "broken" links if an upload fails

  To prevent users from seeing raw "broken" links if an upload fails, Add Phoenix Channel 
  "hook" that only broadcasts the image to the chat after the React client confirms 
  the PUT request was successful.

  #To prevent "broken" links, we move the broadcast out of the initial
  #comment creation and into a second "Confirmation" step.

3. React Frontend Hook (EventComments.tsx)
In your React component, you chain these events together. If the PUT to R2 fails, 
you never call confirm_upload, and the broken link never appears for other users.
*/

const handleUploadAndPost = async (file, content) => {
  // 1. Tell Phoenix we are starting
  channel.push("start_upload_comment", { content, image_url: fileName })
    .receive("ok", async ({ comment_id }) => {
      
      // 2. Get Presigned URL and PUT to Cloudflare R2
      const { upload_url } = await getPresignedUrl(fileName);
      const uploadRes = await fetch(upload_url, { method: "PUT", body: file });

      if (uploadRes.ok) {
        // 3. SUCCESS: Confirm to Phoenix to trigger the broadcast
        channel.push("confirm_upload", { comment_id });
      } else {
        // FAIL: The comment stays 'is_published: false' and no one ever sees it
        toast({ title: "Upload Failed", variant: "destructive" });
      }
    });
};

/*
. Why this is the "Golden Path":

    Zero Ghost Content: If a user closes their laptop halfway through a 20MB upload, the database has a record, but because is_published is false, it never shows up in anyone's feed.
    Optimistic UI Control: You can show the sender a "Uploading..." state locally, but other users only see the message the moment it is safely hosted on R2.
    Database Cleanup: You can run a simple Oban cron job every 24 hours to delete any is_published: false comments that are older than 1 hour (orphaned uploads).

Summary of the Flow:

    React creates a "Pending" comment in Elixir.
    React uploads the 10MB photo to R2.
    React confirms success to Elixir.
    Elixir broadcasts the final message to the chat.
*/


