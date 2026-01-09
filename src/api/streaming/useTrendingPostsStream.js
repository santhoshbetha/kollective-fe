import { useTimelineStream } from './useTimelineStream.js';

function useTrendingPostsStream({ onlyMedia, enabled } = {}) {
  return useTimelineStream(
    `community${onlyMedia ? ':media' : ''}`,
    `public:local${onlyMedia ? ':media' : ''}`,
    undefined,
    { enabled },
  );
}

export { useTrendingPostsStream };