/*
Cloudflare R2 upload flow 
1. React Frontend: The Upload Flow
When a user submits a post, your React app uses the FormData API. This automatically sets the correct 
multipart/form-data boundaries. Crucial: Do not manually set
the Content-Type header when sending FormData, or the boundary strings will be missing

*/
const handleUpload = async (file, content, scope) => {
  const token = localStorage.getItem('user_token');
  const formData = new FormData();

  // Nest parameters to match Phoenix conventions
  formData.append('post[content]', content);
  formData.append('post[category]', 'voice');
  formData.append('post[target_scope]', scope);
  formData.append('post[media]', file); 

  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // 'Content-Type' is omitted; the browser adds it with boundary
      },
      body: formData
    });
    const result = await response.json();
    console.log("Upload Success:", result.data);
  } catch (error) {
    console.error("Upload failed", error);
  }
};

/*
3. Display Flow: Secure Retrieval
Since your R2 bucket is private, your backend must generate Presigned URLs for the React app to display images. 

    Elixir Action: In your PostJSON serializer, call Kollective.MediaUploader.url({post.media, post}, :thumb, signed: true).
    React Rendering: React receives a URL containing an authentication signature (e.g., .../thumb.jpg?X-Amz-Signature=...). It places this directly in the src of the <img> tag.
    R2 Handshake: The browser fetches the image directly from Cloudflare. Cloudflare verifies the signature and serves the asset with zero egress costs. 
*/

/*
Phase 	Tool	                          Responsibility
Upload	React FormData	              Bundles text and file into a single binary stream.
Ingress	Phoenix Plug.Upload	          Receives and caches the temporary file on the server.
Process	Waffle + ImageMagick	      Generates optimized 300x300 thumbnails.
Storage	ExAws.S3 + R2	              Streams final files to private Cloudflare storage.
Authorize	Elixir Signing	          Generates time-limited URLs for valid users.
*/
