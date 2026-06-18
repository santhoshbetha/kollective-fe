import { AspectRatio } from "@/components/ui/aspect-ratio"; // Shadcn
import { getOptimizedImage } from "@/lib/utils/image";

export function ChatImage({ src }: { src: string }) {
  return (
    <div className="w-[300px] overflow-hidden rounded-lg border">
      <AspectRatio ratio={16 / 9}>
        <img
          src={getOptimizedImage(src, 600)} // Request a 600px wide version
          alt="Shared image"
          loading="lazy"
          className="h-full w-full object-cover transition-opacity hover:opacity-90"
        />
      </AspectRatio>
    </div>
  );
}

/*
Update your CommentItem or EventImage to use the optimized URL.
 This ensures the user's browser only downloads a ~100KB file instead of the 10MB original.
*/

/*
4. Why this is the "Golden Path" for Standalone Apps:

    Massive Bandwidth Savings: A 10MB JPEG becomes a 60KB WebP automatically using f_auto (Cloudinary) or auto=format (Imgix) Cloudinary Format Optimization.
    Responsive Images: You can call getOptimizedImage(url, 200) for thumbnails and getOptimizedImage(url, 1200) for full-screen previews using the same original file.
    Zero Server Load: Your Elixir backend never has to resize images; the proxy handles everything on its own edge network.

Important Configuration

    Cloudinary: Ensure "Fetched URL" delivery is enabled in your Cloudinary Security Settings.
    Imgix: If using R2, set up an "S3 Compatible" source in the Imgix Dashboard.

Pro-Tip: For maximum speed, use the srcset attribute to let the browser choose the best size for the user's screen (e.g., small for mobile, medium for desktop).
*/
