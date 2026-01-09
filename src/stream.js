import { ExponentialBackoff, Websocket, WebsocketBuilder } from 'websocket-ts';

import { getAccessToken } from './utils/auth';
import useBoundStore from './stores/boundStore.js';

export function connectStream(path, callbacks) {
  const streamingAPIBaseURL = "https://tempurl"; // TODO: replace with real URLgetState().instance.configuration.urls.streaming;
  const accessToken = getAccessToken(useBoundStore.getState());
  const { onConnect, onDisconnect, onReceive } = callbacks();

  let subscription;

  // If the WebSocket fails to be created, don't crash the whole page,
  // just proceed without a subscription.
  try {
    subscription = getStream(streamingAPIBaseURL, accessToken, path, {
      connected() {
        onConnect(); // websocket connect
      },

        disconnected() {
          onDisconnect();
        },

      received(data) {
        onReceive(subscription, data);
      },

      reconnected() {
        onConnect();
      },

    });
  } catch (e) {
    console.error(e);
  }

  const disconnect = () => {
    if (subscription) {
      subscription.close();
    }
  };

  return disconnect;
}

export default function getStream(streamingAPIBaseURL, accessToken, stream, { connected, received, disconnected, reconnected }) {
  const params = [ `stream=${stream}` ];  //san this

  const ws = new WebsocketBuilder(`${streamingAPIBaseURL}/api/v1/streaming/?${params.join('&')}`)  //san this websocket stream
    .withProtocols(accessToken)
    .withBackoff(new ExponentialBackoff(1000, 6))
    .build();

    ws.onOpen((_ws, ev) => {
      connected?.(ev);
    });

    ws.onClose((_ws, ev) => {
      disconnected?.(ev);
    });

    ws.onReconnect((_ws, ev) => {
      reconnected(ev);
    });

    ws.onMessage((_ws, e) => {
      if (!e.data) return;
      try {
        received(JSON.parse(e.data));
      } catch (error) {
        console.error(error);
        console.error(`Could not parse the above streaming event.\n${error}`);
      }
    });


  return ws;
}
