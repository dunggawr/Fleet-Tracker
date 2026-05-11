// ===== WebSocket Client =====

import { io, Socket } from 'socket.io-client';
import { api } from './api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/tracking`, {
      autoConnect: false,
      transports: ['websocket'],
      withCredentials: true, // Send cookies with handshake
    });

    // Active refresh session on reconnect
    socket.io.on('reconnect_attempt', async () => {
      console.log('Socket: Reconnect attempt, refreshing session...');
      try {
        await api.refreshSession();
      } catch (error) {
        console.error('Socket: Failed to refresh session on reconnect', error);
      }
    });
  }
  return socket;
}

export async function connectSocket() {
  const s = getSocket();
  if (!s.connected) {
    // Proactive refresh before initial connection
    try {
      await api.refreshSession();
    } catch (error) {
      console.error('Socket: Pre-connect session refresh failed', error);
    }
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

// === Typed Events ===
export const SOCKET_EVENTS = {
  // GPS
  GPS_UPDATE: 'gps:update',
  GPS_SUBSCRIBE: 'gps:subscribe',
  GPS_UNSUBSCRIBE: 'gps:unsubscribe',

  // Alerts
  ALERT_NEW: 'alert:new',
  ALERT_RESOLVED: 'alert:resolved',

  // Orders
  ORDER_STATUS_CHANGED: 'order:status-changed',

  // Trips
  TRIP_STATUS_CHANGED: 'trip:status-changed',

  // Driver
  DRIVER_STATUS_CHANGED: 'driver:status-changed',
  DRIVER_SOS: 'driver:sos',
} as const;
