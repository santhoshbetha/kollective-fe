import { useTimelineStream } from './useTimelineStream.js';

function useCommunityStream({ onlyMedia, enabled } = {}) {
  return useTimelineStream(
    `community${onlyMedia ? ':media' : ''}`,
    `public:local${onlyMedia ? ':media' : ''}`,
    undefined,
    { enabled },
  );
}

export { useCommunityStream };