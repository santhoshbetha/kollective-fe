import { useTimelineStream } from './useTimelineStream.js';

function useGroupStream(groupId) {
  return useTimelineStream(
    `group:${groupId}`,
    `group&group=${groupId}`,
  );
}

export { useGroupStream };