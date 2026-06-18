/*
# "Upload Status" WebSocket
4. React Frontend: The "Processing" Spinner
In your React app, listen for the "video_ready" event to swap the spinner for the actual video player.
*/

// React: PostItem.js
const [isProcessing, setIsProcessing] = useState(post.processing_status === 'processing');

useEffect(() => {
  const channel = socket.channel(`user_updates:${currentUser.id}`);
  channel.join();

  channel.on("video_ready", (payload) => {
    if (payload.post_id === post.id) {
      setIsProcessing(false);
      setVideoUrl(payload.video_url);
    }
  });

  return () => channel.leave();
}, [post.id]);

if (isProcessing) {
  return (
    <div className="flex items-center space-x-2 text-blue-600">
      <Spinner className="animate-spin" />
      <span>Optimizing video for your district...</span>
    </div>
  );
}

/*
Why this works for Discovery

    User Retention: Users won't navigate away thinking the app is broken; the spinner gives them confidence the server is working.
    Immediate Feedback: The moment the 720p Web-ready version is stored on Cloudflare R2, the user's feed updates instantly.
    Reliability: Using Oban ensures that even if the server restarts during a long transcode, the job will resume and the notification will eventually be sent. 
*/