import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const { token } = useAuthStore.getState();

    this.socket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
