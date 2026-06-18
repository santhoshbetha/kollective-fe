import AttachmentThumbs from 'soapbox/components/attachment-thumbs.tsx';
import PreviewCard from 'soapbox/components/preview-card.tsx';

/**
 * Minimized StatusMedia
 * Focuses on standard HTML5 Video/Audio and simple gallery logic.
 */
const PostMedia = ({ status, muted, showMedia = true, onToggleVisibility }) => {
  const attachments = status.media_attachments || [];
  const first = attachments[0];

  if (attachments.length === 0) {
    // Render URL Preview Card if no media but a link exists
    return status.card ? <PreviewCard card={status.card} compact /> : null;
  }

  // 1. Muted / Thumbnail mode (common in quoted posts)
  if (muted) {
    return <AttachmentThumbs media={attachments} sensitive={status.sensitive} />;
  }

  // 2. Video Player
  if (attachments.length === 1 && first.type === 'video') {
    return (
      <div className="relative mt-2 rounded-lg overflow-hidden bg-black aspect-video">
        <video 
          src={first.url} 
          poster={first.preview_url} 
          controls 
          className="w-full h-full"
        />
      </div>
    );
  }

  // 3. Audio Player
  if (attachments.length === 1 && first.type === 'audio') {
    return (
      <audio 
        src={first.url} 
        controls 
        className="w-full mt-2" 
      />
    );
  }

  // 4. Default: Image Gallery (Simple placeholder or your Gallery component)
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {attachments.map((media, i) => (
        <img 
          key={i}
          src={media.preview_url || media.url} 
          alt={media.description}
          className="rounded-lg object-cover h-48 w-full cursor-pointer"
          onClick={() => window.open(media.url, '_blank')}
        />
      ))}
    </div>
  );
};

export default PostMedia;
