import { useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (handlers) => {
  const socket = useMemo(
    () =>
      io(socketUrl, {
        transports: ['websocket'],
      }),
    []
  );

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    Object.entries(handlers || {}).forEach(([event, callback]) => {
      if (callback) {
        socket.on(event, callback);
      }
    });

    return () => {
      Object.entries(handlers || {}).forEach(([event, callback]) => {
        if (callback) {
          socket.off(event, callback);
        }
      });
    };
  }, [handlers, socket]);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return socket;
};

