import { useTimelineStream } from './useTimelineStream.js';

function usePublicStream({ onlyMedia, language } = {}) {
  return useTimelineStream(
    `public${onlyMedia ? ':media' : ''}`,
    `public${onlyMedia ? ':media' : ''}`,
    null,
    { enabled: !language }, // TODO: support language streaming
  );
}

export { usePublicStream };