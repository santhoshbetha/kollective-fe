/*
"Thumbnail Preview" in the input area so users can see the image 
they've selected before they hit upload
*/
/*
To make the upload flow feel professional, we'll add a
Local Preview using URL.createObjectURL. This allows the user to see their image instantly
(0ms latency) while the 10MB file is still being prepared for the Cloudflare R2 upload.
*/
/*
1. The React Logic (CommentInput.tsx)
We’ll use Shadcn/UI's Button and X icon to allow the user to "clear"
 the selection if they picked the wrong photo.
*/
import { useState, useEffect } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function CommentInput({ channel, eventId }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { uploadFile, progress, isUploading } = useFileUpload();

  // 1. Handle File Selection & Create Local Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create a temporary local URL for the <img> tag
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  // 2. Cleanup memory when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="p-4 border-t bg-white space-y-4">
      {/* --- THE THUMBNAIL PREVIEW --- */}
      {previewUrl && (
        <div className="relative inline-block">
          <div className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-slate-200">
            <img 
              src={previewUrl} 
              className="h-full w-full object-cover" 
              alt="Preview" 
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </div>
          
          {!isUploading && (
            <button
              onClick={clearFile}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* --- INPUT AREA --- */}
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          {isUploading && <Progress value={progress} className="h-1" />}
          <Textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[80px]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={isUploading}
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading || (!text && !file)}>
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
/*
2. Why this is the "Golden Path" for Standalone:

    Memory Efficiency: URL.createObjectURL is much faster than FileReader.readAsDataURL because it doesn't convert the image to a massive Base64 string. We use URL.revokeObjectURL to ensure the browser's memory is cleared MDN URL.createObjectURL.
    Instant Feedback: The user sees their photo the moment they select it. This reduces "Upload Anxiety" where users wonder if the correct file was chosen.
    State Control: By disabling the "X" button during isUploading, we prevent the user from deleting the file while the XHR/R2 transfer is mid-stream. 
*/
/*
3. Summary of the "Preview" Flow:

    User selects a 10MB photo.
    React generates a local blob URL and shows the thumbnail instantly.
    User types their comment.
    User hits Post.
    UI shows the spinning loader over the thumbnail and the progress bar.
    R2 Upload finishes; the form resets.
*/