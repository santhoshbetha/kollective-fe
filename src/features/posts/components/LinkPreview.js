/*
Link Previews (OpenGraph)

 (The Rich Card)
Your React Post component checks if metadata.link_preview exists and renders a nice card.
*/

const LinkPreview = ({ preview }) => {
  if (!preview) return null;

  return (
    <a href={preview.url} target="_blank" className="block border rounded-xl overflow-hidden mt-3 hover:bg-gray-50 transition">
      {preview.image && <img src={preview.image} className="w-full h-48 object-cover" />}
      <div className="p-3">
        <h4 className="font-bold text-sm line-clamp-1">{preview.title}</h4>
        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{preview.description}</p>
        <span className="text-[10px] text-gray-400 uppercase mt-2 block">{new URL(preview.url).hostname}</span>
      </div>
    </a>
  );
};

/*
4. Why this is "Standalone" Gold

    Engagement: Posts with link previews get significantly higher click-through rates.
    Zero Wait: The post is saved instantly; the "Link Card" appears 1-2 seconds later via the WebSocket once the Elixir scraper finishes.
    Security: By scraping on your server, you prevent "Mixed Content" warnings in the browser and can cache previews for popular links.
*/