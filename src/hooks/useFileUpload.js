import { set } from "lodash";
import { useState } from "react";

/*
To make a 10MB upload feel "instant," we use a
two-stage optimistic UI: first, we show the text comment immediately in a "sending" state, and 
second, we use a Shadcn/UI Progress bar to show the actual binary transfer to Cloudflare R2.

"Upload + Progress Bar" code to make the 10MB upload feel smooth for the user
This hook manages the XHR request because the native fetch doesn't support progress tracking.
*/

export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [xhr, setXhr] = useState<XMLHttpRequest | null>(null);

  // THE RESET FUNCTION
  const reset = () => {
    setProgress(0);
    setError(null);
  };
    
  //"Delete Upload" 
  const abort = () => {
    if (xhr) {
      xhr.abort(); // Kills the connection to R2 immediately
      setXhr(null);
      setProgress(0);
    }
  };


  const uploadFile = (url, file) => {
    // We call reset automatically at the start of every attempt
    reset(); 
    return new Promise((resolve, reject) => {
      const newXhr = new XMLHttpRequest();
      setXhr(newXhr);
      
      newXhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      });

      newXhr.addEventListener("load", () => {
        if (newXhr.status >= 200 && newXhr.status < 300) resolve();
        else {
          setError("Upload failed server-side");
          reject();
        }
      });

      newXhr.addEventListener("error", () => {
        setError("Network error occurred");
        reject();
      });
      
      newXhr.open("PUT", url);
      newXhr.setRequestHeader("Content-Type", file.type);
      newXhr.send(file);
    });
  };

  return { uploadFile, progress, setProgress, error, reset, abort };
};

/*

How to use it in your Retry Button:

When the user clicks Retry, you call reset() to clear the red 
error state and reset the progress bar to 0% before the new uploadFile call begins.

<Button 
  variant="outline" 
  onClick={() => {
    reset(); // Clear old errors/progress
    performUpload(pendingId); // Try again
  }}
>
  <RefreshCw className="mr-2 h-4 w-4" />
  Retry Upload
</Button>
*/
