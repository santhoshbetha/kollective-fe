/*
  # "Video Transcoding" using FFmpeg so that large uploaded videos are
  # compressed automatically before they reach Cloudflare R2

  4. React Frontend: Video Player
  Use the video_url in a standard HTML5 player or a library like react-player.
*/
// React: VideoPost.js
<video 
  controls 
  poster={post.media.thumbnail_url} 
  className="w-full rounded-lg"
  preload="none" // Save bandwidth: don't load until play is clicked
>
  <source src={post.media.video_url} type="video/mp4" />
  Your browser does not support the video tag.
</video>

/*
5. Why this is a Discovery Powerhouse

    Standardization: No matter what format a candidate uploads (.mov from iPhone, .avi from PC), every user in the State Senate District sees a standard, optimized MP4.
    Automatic Thumbnails: FFmpeg automatically creates a "Poster" image from the video, so your discovery feed looks great without the user having to upload a separate thumbnail.
    Mobile-First: By scaling to 720p and using the H.264 codec, you ensure that even users on 3G connections in rural areas can watch campaign messages without constant buffering.
*/