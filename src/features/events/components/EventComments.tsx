// event Image
export function EventImageUpload({ eventId, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // 1. Ask Elixir for a Presigned URL
    const res = await fetch(`/api/events/${eventId}/upload-url?filename=${file.name}`);
    const { upload_url, final_asset_url } = await res.json();

    // 2. Upload directly to S3
    const uploadRes = await fetch(upload_url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type }
    });

    if (uploadRes.ok) {
      // 3. Tell Elixir/Channels the upload is done so it can post the comment
      onUploadSuccess(final_asset_url);
    }
    setIsUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Input type="file" id="event-photo" className="hidden" onChange={handleFileChange} />
      <Button variant="ghost" size="icon" onClick={() => document.getElementById('event-photo')?.click()}>
        {isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
      </Button>
    </div>
  );
}

/*
add this to  AWS S3 Console and add this CORS policy to your bucket
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-app.com"],
    "ExposeHeaders": []
  }
]

3. Cloudflare R2 CORS (Very Important)
Just like S3, R2 will block your React app unless you set a CORS policy. In the Cloudflare Dashboard:

    Go to R2 > Buckets > Your Bucket > Settings.
    Find CORS Policy and click Add CORS Policy.
    Paste the same JSON we used for S3:

[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-app.com"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"]
  }
]


4. Why this is the "Golden Path" for Standalone Apps:

    Zero Server Load: Your Elixir server only handles a small JSON request for the URL. The actual megabytes of image data go straight to Amazon/Cloudflare/DigitalOcean.
    Security: Users can only upload files to the path you specify, and the link expires quickly.
    Scalability: You don't need to worry about multipart form limits in Phoenix.Endpoint because the file never touches your app. 

Summary of the Flow:

    React: "Hey Elixir, I want to upload sunny.jpg to Event 12."
    Elixir: "Cool, here is a 15-minute key for s3://bucket/events/12/sunny.jpg."
    React: Sends binary data to S3 using that key.
    React: Tells the EventChannel: "Image is uploaded at this URL, post it now!"
    Elixir: Broadcasts the new comment with the image <img> tag to all attendees.
*/
