import React, { useState } from 'react';
import axios from 'axios';

/*
 "Progress Bar" in React to show the user the live upload
  percentage as the file is being sent to your server
  To implement a
Progress Bar in React, you cannot use the standard fetch API, as it doesn't 
provide progress events for uploads. Instead, you should use XMLHttpRequest or a 
library like Axios.
This is crucial for your "Voice" posts because videos and high-res images can be 
large, and users in local districts need to know the app hasn't "frozen" during the 
upload to Cloudflare R2.

1. React Implementation (using Axios)
Axios has a built-in onUploadProgress callback that makes this very simple.
*/

const PostUploadWithProgress = ({ token }) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file, content) => {
    const formData = new FormData();
    formData.append('post[content]', content);
    formData.append('post[media]', file);

    setIsUploading(true);

    try {
      await axios.post('/api/posts', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        // This is the magic part
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });
      
      alert("Upload complete!");
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ... your input fields ... */}

      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-blue-700">Uploading to District Feed...</span>
            <span className="text-sm font-medium text-blue-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

/*
2. How it works with your Elixir Backend

    Client-Side: The progress bar reflects the data being streamed from the user's browser to your Phoenix server.
    Server-Side: Once the file arrives at your server, Phoenix processes it via Waffle (ImageMagick thumbnailing) and then streams it to Cloudflare R2.
    UI Feedback: The progress bar will hit 100% when your server receives the full file. You might see a small delay at 100% while Waffle performs the thumbnail transformation and R2 upload before the server sends the final "Success" JSON response.
*/

/*
3. Improving the "Aha!" Moment
Since the "100% to Success" gap can be a few seconds (processing time), it's a best practice to change the label at 100%:

    0-99%: "Uploading..."
    100%: "Optimizing media for your district..."
*/