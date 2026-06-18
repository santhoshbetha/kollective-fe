import { getOptimizedImage } from "@/lib/utils/image";

export function EventHeader({ event }) {
  return (
    <div 
      className="w-full h-64 bg-slate-200 bg-cover bg-center transition-all duration-700"
      style={{ 
        backgroundImage: `url(${getOptimizedImage(event.banner_url, 1200)})` 
      }}
    >
      {/* Overlay to ensure title is readable if banner is bright */}
      <div className="w-full h-full bg-black/20 flex items-end p-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-md">
          {event.name}
        </h1>
      </div>
    </div>
  );
}

/*
Why this is the "Golden Path":

    Deterministic Randomness: By using rem(id, count), the event always has the same default banner. It doesn't flicker or change every time the user refreshes the page.
    Zero Null Checks: The React code is much cleaner because event.banner_url is guaranteed to be a string.
    Bandwidth Efficiency: Even your default "fallback" images are optimized by your Imgix/Cloudinary proxy before they hit the user's phone.
    Professional Look: Empty states make an app look "under construction." Default patterns make it look "populated."

Summary of the Flow:

    Database: banner_url is nil.
    Elixir JSON: Detects nil → Assigns pattern-blue.jpg based on ID.
    React: Requests the image through the proxy.
    Proxy: Serves a 1200px WebP version of the blue pattern.
*/