// src/features/accounts/hooks/useAccountGallery.js
// Gallery Selectors (getAccountGallery / getGroupGallery)
import { useMemo } from "react";
import { useTimeline } from "../../statuses/api/useTimeline";

export const useAccountGallery = (accountId) => {
  const { data: timeline } = useTimeline(`account:${accountId}:media`, `/api/v1/accounts/${accountId}/statuses`, { only_media: true });

  return useMemo(() => {
    if (!timeline) return [];
    
    // Flatten pages and extract media while attaching parent status info
    return timeline.pages
      .flatMap(page => page.items)
      .filter(status => !status.reblog) // Gallery usually skips reblogs
      .flatMap(status => 
        status.media_attachments.map(media => ({
          ...media,
          status,
          account: status.account
        }))
      );
  }, [timeline]);
};
