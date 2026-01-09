import useTimelinesStore from "../stores/timelinesStore";

// Lightweight browser WebSocket helper for development.
// Usage example:
//   import startWebsocket from './lib/ws'
//   const stop = startWebsocket('wss://example.com/ws')
//   // later: stop()

export default function startWebsocket(url = "/api/v1/streaming") {
  if (typeof window === "undefined" || typeof WebSocket === "undefined") {
    console.debug("startWebsocket: no WebSocket available in this environment");
    return () => {};
  }

  const wsUrl =
    url.startsWith("ws://") || url.startsWith("wss://")
      ? url
      : location.protocol === "https:"
        ? `wss://${location.host}${url}`
        : `ws://${location.host}${url}`;
  let ws;
  try {
    ws = new WebSocket(wsUrl);
  } catch (err) {
    console.debug("startWebsocket: failed to create WebSocket", err);
    return () => {};
  }

  const timelines = useTimelinesStore.getState();

  ws.addEventListener("open", () => {
    console.debug("WebSocket connected to", wsUrl);
  });

  ws.addEventListener("message", (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      // Expecting payloads shaped like: { type: 'status', timeline: 'home', status: { ... } }
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "status" && msg.status) {
        const timeline = msg.timeline || "home";
        try {
          timelines.processTimelineUpdate(timeline, msg.status);
        } catch (e) {
          console.debug("ws: processTimelineUpdate error", e);
        }
      }
    } catch (e) {
      console.debug("ws: failed to parse message", e);
    }
  });

  ws.addEventListener("close", (ev) => {
    console.debug("WebSocket closed", ev);
  });

  ws.addEventListener("error", (err) => {
    console.debug("WebSocket error", err);
  });

  // return stop function
  return function stop() {
    try {
      ws.close();
    } catch {
      /* ignore */
    }
  };
}
