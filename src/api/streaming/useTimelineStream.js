import { useEffect, useRef, useCallback, useMemo } from 'react';
import { getAccessToken } from '../../utils/auth.js';
import useBoundStore from '../../stores/boundStore.js';

function useTimelineStream(...args) { //san this web sockets
  // TODO: get rid of streaming.ts and move the actual opts here.
  const [timelineId, path, accept, maybeOpts] = args;
  const opts = useMemo(() => maybeOpts ?? {}, [maybeOpts]);
  const { enabled = true } = opts;

  const stream = useRef(null);

  const accessToken = useBoundStore(getAccessToken);
  const streamingUrl = "https://tempurl"; // TODO: replace with real URL (instance.configuration.urls.streaming)

  const connect = useCallback(() => { // websocket connect
    if (enabled && streamingUrl && !stream.current) {
      stream.current = useBoundStore.getState().timelines.connectTimelineStream(
        timelineId,
        path,
        accept,
        opts,
      );
    }
  }, [enabled, streamingUrl, timelineId, path, accept, opts]);

  const disconnect = () => {
    if (stream.current) {
      stream.current();
      stream.current = null;
    }
  };

  useEffect(() => {
    // call connect asynchronously to avoid synchronous store updates during render
    void Promise.resolve().then(() => connect());
    return () => {
      disconnect();
    };
  }, [accessToken, streamingUrl, timelineId, path, enabled, connect]);

  return {
    disconnect,
  };
}

export { useTimelineStream };