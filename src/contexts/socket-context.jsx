// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Socket } from 'phoenix';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, token }) => {
  const socket = useMemo(() => {
    const newSocket = new Socket("ws://localhost:4000/socket", {
      params: { access_token: token }
    });
    newSocket.connect();
    return newSocket;
  }, [token]);

  useEffect(() => {
    return () => socket.disconnect();
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
