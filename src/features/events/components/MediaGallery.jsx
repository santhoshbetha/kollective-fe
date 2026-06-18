import { getOptimizedImage } from "@/lib/utils/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

/*
 you can build a responsive "Masonry-style" or uniform grid.

*/

export function MediaGallery({ media }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {media.map((item) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <div className="cursor-zoom-in group relative overflow-hidden rounded-xl border bg-slate-100 transition-all hover:shadow-md">
              <AspectRatio ratio={1 / 1}>
                <img
                  src={getOptimizedImage(item.url, 400)}
                  alt="Event media"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </AspectRatio>
              {item.type === "official" && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Official
                </div>
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 border-none bg-transparent">
            {/* High-res Lightbox Preview */}
            <img src={getOptimizedImage(item.url, 1200)} className="w-full rounded-lg" />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

/*
3. Key Implementation Details

    Automatic Sync: Because the query filters for moderation_status == "approved", the gallery updates instantly as soon as your Oban AI worker finishes scanning a chat photo.
    Optimized Thumbnails: Notice getOptimizedImage(item.url, 400). This ensures that even if there are 100 photos in the gallery, the browser only downloads small, fast-loading thumbnails.
    Lightbox Experience: Using the Shadcn Dialog allows users to click any photo to see it in high resolution (1200px) without leaving the page.
    Performance: For very large galleries, you can wrap this in your TanStack Virtual logic to only render the images visible on the screen. 

Summary of the Gallery Flow:

    User uploads a photo to the event chat.
    Oban scans and sets status to approved.
    User clicks the "Gallery" tab on the event page.
    Elixir returns the banner + all approved chat images.
    React renders a clean grid of optimized thumbnails.
*/

//=============================================================================================
//Media Gallery Moderation, 
//The Admin Overlay
// Inside MediaGallery.tsx (merge with above later)
export function MediaItem({ item, isOrganizer, onRemove }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-slate-100">
      <AspectRatio ratio={1 / 1}>
        <img
          src={getOptimizedImage(item.url, 400)}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </AspectRatio>

      {/* ADMIN OVERLAY */}
      {isOrganizer && item.type === "user_upload" && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="icon" 
            variant="destructive" 
            className="h-8 w-8 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation(); // Don't open the lightbox
              onRemove(item.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/*
4. Why this is the "Golden Path" for Standalone Apps:

    Privacy Control: If a user posts a photo that is technically "safe" (passes AI) but off-topic or embarrassing, the organizer has total control.
    Unified State: Since the Gallery and Chat both look at the moderation_status, one "Reject" action cleans up the entire event page.
    Performance: Using Phoenix.PubSub ensures that when the organizer clicks "Delete," the photo disappears for everyone currently viewing the gallery in milliseconds.

    Summary of the Final Media Stack:
    Direct Upload: Browser \(\rightarrow \) Cloudflare R2.
    Proxy: Imgix/Cloudinary \(\rightarrow \) Browser (Optimized).
    AI Scan: Oban \(\rightarrow \) Sightengine (Automated).
    Gallery: Elixir Aggregator \(\rightarrow \) Shadcn Grid.
    Curation: Organizer \(\rightarrow \) Manual Override.
  
*/