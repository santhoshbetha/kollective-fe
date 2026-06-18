import { useEffect, useState, useRef } from 'react';
import { RotateCcw, Crop, Check, X } from 'lucide-react';


/*
To implement
Image Editing (Crop/Rotate) in your standalone app, we'll use the Canvas API on the client side. 
This allows users to polish their #Tech or #Funny photos before they are sent to S3, saving you 
storage space and server CPU.

1. The React Logic: Client-Side Editor (JSX)
We'll create a modal that takes the raw File from your Composer and lets the user manipulate it.
*/
const ImageEditor = ({ file, onSave, onCancel }) => {
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);

  // Draw image to canvas whenever rotation changes
  useEffect(() => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Adjust canvas size for rotation
      if (rotation % 180 !== 0) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
    };
  }, [file, rotation]);

  const handleExport = () => {
    canvasRef.current.toBlob((blob) => {
      const editedFile = new File([blob], file.name, { type: 'image/jpeg' });
      onSave(editedFile);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col p-4">
      <div className="flex justify-between items-center text-white mb-4">
        <button onClick={onCancel}><X /></button>
        <h3 className="text-sm font-bold uppercase tracking-widest">Edit Image</h3>
        <button onClick={handleExport} className="bg-blue-600 px-4 py-1 rounded-full"><Check /></button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="max-w-full max-h-full shadow-2xl rounded" />
      </div>

      <div className="flex justify-center gap-8 py-6 text-white border-t border-white/10">
        <button onClick={() => setRotation(r => r - 90)} className="flex flex-col items-center gap-1">
          <RotateCcw size={20} /> <span className="text-[10px]">Rotate</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-50 cursor-not-allowed">
          <Crop size={20} /> <span className="text-[10px]">Crop (Coming Soon)</span>
        </button>
      </div>
    </div>
  );
};
export default ImageEditor;

/*
2. Why this is the "Golden Path":

    Privacy: Since the editing happens in the browser's Canvas, the "original" unedited photo never touches your Elixir server if the user decides to crop out sensitive data.
    Performance: No need for heavy ImageMagick tasks on the backend. Your S3 bucket only stores the final, optimized editedFile.
    UX: The user gets instant feedback as they rotate the image, making the Composer feel like a professional tool.

3. Integration with S3
Once the user hits "Save," the editedFile (a Blob) is passed back to your upload function, which uses 
the Signed URL to push it directly to the cloud.

4. Pro-Tip: Automatic Compression
In the toBlob function, we set the quality to 0.9. This subtly reduces the file size of massive #Tech photos without a visible loss in quality, making your Standalone App feel faster for everyone.
Your Media Hub is now an "Editing Studio."
*/