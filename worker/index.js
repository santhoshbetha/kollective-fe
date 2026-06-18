/*
Cloudflare Workers to automatically generate
Thumbnails for these event photos so the chat doesn't lag with full-size images

1. The Worker Logic (index.ts)
This Worker acts as a proxy. It intercepts requests 
like ://yoursite.com, fetches photo.jpg from R2, and resizes it to 200px before serving it.
*/

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.split("/"); // Expected: /img/200/filename.jpg
    
    const size = parseInt(path[2]);
    const filename = path.slice(3).join("/");

    if (!size || !filename) return new Response("Invalid Request", { status: 400 });

    // 1. Fetch the original from R2
    const object = await env.MY_BUCKET.get(filename);
    if (!object) return new Response("Not Found", { status: 404 });

    // 2. Return with Resizing Options
    // Cloudflare's 'fetch' can trigger resizing automatically on R2/S3 assets
    return fetch(request, {
      cf: {
        image: {
          width: size,
          fit: "cover",
          format: "auto", // Automatically serves WebP/AVIF if supported
          quality: 80
        }
      }
    });
  }
};
