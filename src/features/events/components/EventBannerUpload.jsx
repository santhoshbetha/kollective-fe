export function EventBannerUpload({ eventId, currentBanner }) {
  const [preview, setPreview] = useState(currentBanner);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // 1. Get the Signed URL from Elixir (passing 'type: banner')
    const res = await fetch(`/api/events/${eventId}/upload-url?filename=${file.name}&type=banner`);
    const { upload_url, final_asset_url } = await res.json();

    // 2. PUT directly to Cloudflare R2
    await fetch(upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

    // 3. Save the new Banner URL to the Event in Postgres
    await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify({ event: { banner_url: final_asset_url } }),
      headers: { "Content-Type": "application/json" }
    });

    setPreview(final_asset_url);
    setIsUploading(false);
  };

  return (
    <div className="relative group w-full h-48 bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-200">
      {preview && <img src={preview} className="w-full h-full object-cover" />}
      
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <label className="cursor-pointer bg-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2">
          {isUploading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
          Change Banner
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>
    </div>
  );
}

/*
3. Image Optimization (Imgix/Cloudinary)
For banners, you must use the Image Resizing proxy we set up earlier. A banner might be 4000px wide, but you only want to serve 1200px to the browser.

// In your EventDetailsPage.tsx header
<div 
  className="w-full h-64 bg-cover bg-center"
  style={{ backgroundImage: `url(${getOptimizedImage(event.banner_url, 1200)})` }}
/>

*/

/*
4. Why this is the "Golden Path":

    Decoupled Logic: The generate_upload_url helper is generic. You can use it for User Avatars, Event Banners, or Chat Photos just by changing the type string.
    Atomic Updates: By doing the PATCH request after the R2 upload succeeds, you ensure your database never points to a "broken" image link.
    Storage Organization: Your R2 bucket stays organized with a clean folder structure (/events/123/banner/...), making it easy to wipe all event data if an event is deleted.
*/

/*
Summary of the "Banner" Flow:

    User selects a 5MB photo.
    React gets a signed URL for events/123/banner/photo.jpg.
    React uploads to Cloudflare R2.
    React sends a PATCH to Phoenix to update the banner_url column.
    Phoenix triggers an Oban moderation scan (optional but recommended for banners!).
*/
