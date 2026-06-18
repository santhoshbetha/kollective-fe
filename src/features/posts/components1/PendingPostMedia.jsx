import PlaceholderCard from "./placeholder/PlaceholderCard";

const shouldHaveCard = (pendingStatus) => {
  return Boolean(pendingStatus.content.match(/https?:\/\/\S*/));
};

const PendingPostMedia = ({ status }) => {
  // 1. If images/video are attached
  if (status.media_attachments?.length > 0) {
    return (
      <div className="aspect-video bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-xs text-gray-400">Uploading Media...</span>
      </div>
    );
  } 
  
  // 2. If it's a link but not a quote, show the card skeleton
  if (!status.quote && shouldHaveCard(status)) {
    return <PlaceholderCard />;
  }

  return null;
};

export default PendingPostMedia;

