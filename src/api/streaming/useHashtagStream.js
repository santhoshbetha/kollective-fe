import { useTimelineStream } from './useTimelineStream.js';

function useHashtagStream(tag) {
  return useTimelineStream(
    `hashtag:${tag}`,
    `hashtag&tag=${tag}`,
  );
}

export { useHashtagStream };