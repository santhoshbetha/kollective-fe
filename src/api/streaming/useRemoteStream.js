import { useTimelineStream } from './useTimelineStream.js';

function useRemoteStream({ instance, onlyMedia } = {}) {
  return useTimelineStream(
    `remote${onlyMedia ? ':media' : ''}:${instance}`,
    `public:remote${onlyMedia ? ':media' : ''}&instance=${instance}`,
  );
}

export { useRemoteStream };