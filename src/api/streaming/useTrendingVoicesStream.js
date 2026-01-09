import { useTimelineStream } from './useTimelineStream.js';

function useTrendingVoicesStream({ onlyMedia, enabled } = {}) {
  return useTimelineStream(
    `community${onlyMedia ? ':media' : ''}`,
    `public:local${onlyMedia ? ':media' : ''}`,
    undefined,
    { enabled },
  );
}

export { useTrendingVoicesStream };