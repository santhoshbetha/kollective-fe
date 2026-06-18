import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*
To stop loading 10MB raw photos in your chat,
use a Dynamic Image Proxy. Instead of pointing your <img> tag directly to S3 or R2, 
you route it through Cloudinary or Imgix. These services fetch the original once,
 cache it, and serve a tiny, optimized version based on your URL parameters.

1. Choosing Your Proxy Strategy
Strategy 	                  Best For	                              Implementation
Cloudinary (Fetch)	Quick setup, no "Sources" to config.	    Append your S3/R2 URL to a Cloudinary base URL. Cloudinary Fetch Documentation
Imgix (Source)	    Professional scaling, custom domains.	    Connect your S3/R2 bucket as a "Source" in the Imgix dashboard. Imgix Setup Guide
*/

/*
2. Implementation: The Helper Utility
Create a utility to transform your "Raw" R2/S3 URLs into "Optimized" proxy URLs.
*/
// Replace with your actual Cloudinary Cloud Name or Imgix Domain
const CLOUDINARY_BASE = "https://res.cloudinary.com";
const IMGIX_BASE = "https://your-source.imgix.net";

export function getOptimizedImage(url: string, width = 600) {
  if (!url) return "";

  // Cloudinary Option: f_auto (format), q_auto (quality), w_ (width)
  return `${CLOUDINARY_BASE}f_auto,q_auto,w_${width}/${encodeURIComponent(url)}`;

  // Imgix Option (if S3/R2 is connected as a Source):
  // const path = url.replace("https://your-bucket.r2.dev", "");
  // return `${IMGIX_BASE}${path}?auto=format,compress&w=${width}`;
}

/*
Cloudflare Workers to automatically generate
Thumbnails for these event photos so the chat doesn't lag with full-size images

3. Frontend Implementation (React)
Instead of using the raw R2 URL in your chat, you now use your Worker's proxy URL. 
*/
/*
4. Why this is the "Golden Path" for R2

  Zero Egress Fees: Pulling images from R2 into a Worker costs $0 in bandwidth.
  Edge Caching: Cloudflare caches the resized thumbnail at its edge nodes, so subsequent users load the chat instantly without even hitting your R2 bucket.
  Automatic Formats: By setting format: "auto", the Worker will serve WebP or AVIF to modern browsers, further reducing data usage
*/

//Instead of using the raw R2 URL in your chat, you now use your Worker's proxy URL.
const PROXY_BASE =  import.meta.env.VITE_WORKER_URL;

export function getThumbnail(filename: string, size = 400) {
  if (!filename) return "";
  
  // If it's already a full URL, just return it
  if (filename.startsWith("http")) return filename;

  // Ensure the filename doesn't have a leading slash
  const path = filename.replace(/^\//, "");

  // Matches your worker's /img/:size/:filename structure
  return `${PROXY_BASE}/img/${size}/${path}`;
}

/*
3. Running Locally
To test this "Standalone" stack on your machine, you'll need two terminal windows open:

    Terminal 1 (Vite): npm run dev (Runs your React app on :5173)
    Terminal 2 (Worker): npx wrangler dev (Runs your Worker on :8787)
*/

/*
4. Why this is the "Golden Path"

    Security: You don't hardcode sensitive URLs in your source code.
    Developer Experience: When you run npm run build, Vite automatically swaps the localhost
    URL for your production Cloudflare URL.
    Type Safety: If you use TypeScript, you can define these variables in a src/vite-env.d.ts 
    file to get autocomplete for import.meta.env.VITE_WORKER_URL.
*/

/*
Summary of the "Image Flow":

    React Component calls getThumbnail("events/1/photo.jpg", 300).
    Vite provides the correct Proxy URL based on your .env.
    Browser requests the image from your Cloudflare Worker.
    Worker pulls the 10MB original from R2, shrinks it to 300px, and serves it as a tiny WebP.
*/

/*
// In your Chat component
<img 
  src={getThumbnail(comment.image_path, 200)} 
  className="w-48 h-48 rounded-lg object-cover" 
  loading="lazy" 
/>
*/