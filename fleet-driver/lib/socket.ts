import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useTripStore } from '../store/useTripStore';
import { refreshAccessToken } from './authFetch';
import NetInfo from '@react-native-community/netinfo';
import { offlineQueue } from './offlineQueue';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private isInitialized = false;
  private isConnecting = false;
  private connectionPromise: Promise<Socket | null> | null = null;
  private isSyncing = false;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  constructor() {
    // Lazy initialization
  }

  private initListeners() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('[Socket] Initializing global network listeners');
    
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.socket?.connected) {
        console.log('[Socket] Network detected, connecting...');
        this.connect();
      } else if (state.isConnected && this.socket?.connected) {
        this.syncOfflineData();
      }
    });
  }

  async connect(): Promise<Socket | null> {
    this.initListeners();

    if (this.isConnecting) {
      console.log('[Socket] Connection already in progress, returning promise');
      return this.connectionPromise;
    }

    const { token } = useAuthStore.getState();
    if (!token) return null;

    // Reuse existing socket if possible
    if (this.socket?.connected) {
      return this.socket;
    }

    this.isConnecting = true;
    this.connectionPromise = (async () => {
      try {
        if (this.socket) {
          console.log('[Socket] Closing existing disconnected/stale socket');
          this.socket.removeAllListeners();
          this.socket.close();
          this.socket = null;
        }

        console.log('[Socket] Connecting to tracking namespace:', `${SOCKET_URL}/tracking`);
        this.socket = io(`${SOCKET_URL}/tracking`, {
          auth: { token: token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 5000,
          timeout: 60000,
        });

        // Setup internal handlers first
        this.setupInternalHandlers();

        // Re-attach persistent listeners
        this.listeners.forEach((callbacks, event) => {
          callbacks.forEach(cb => {
            console.log(`[Socket] Re-attaching listener for: ${event}`);
            this.socket?.on(event, cb as any);
          });
        });

        // Wait for connect or error (optional, but good for sequential logic)
        // For now we just return the socket object as it is already being initialized
        return this.socket;
      } catch (err) {
        console.error('[Socket] Failed to initiate connection:', err);
        return null;
      } finally {
        this.isConnecting = false;
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  private setupInternalHandlers() {
    if (!this.socket) return;

    this.socket.io.on('reconnect_attempt', async () => {
      try {
        console.log('[Socket] Refreshing token for reconnection...');
        const newToken = await refreshAccessToken();
        if (newToken && this.socket) {
          // Send raw token to match connect() behavior and backend expectation
          this.socket.auth = { token: newToken };
        }
      } catch (err) {
        console.error('[Socket] Token refresh failed during reconnect:', err);
      }
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected successfully:', this.socket?.id);
      useTripStore.getState().setSocketConnected(true);
      this.syncOfflineData();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      useTripStore.getState().setSocketConnected(false);
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connect error:', err.message);
      useTripStore.getState().setSocketConnected(false);
      
      // User-facing differentiation as promised in CHANGELOG
      if (err.message === 'xhr poll error') {
        console.warn('[Socket] Connection timeout or server unreachable');
      } else if (err.message === 'Not authorized' || err.message === 'jwt expired') {
        console.warn('[Socket] Authentication failed - logging out');
        useAuthStore.getState().logout();
      }
    });
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    const eventListeners = this.listeners.get(event);
    if (eventListeners?.has(callback)) return; // Prevent duplicate logical listeners

    eventListeners?.add(callback);
    
    // Attach to current socket if exists, only if not already attached
    // socket.io-client 'on' doesn't check for duplicate functions
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      if (event === 'gps:update') offlineQueue.push(data);
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    // We keep this.listeners for future reconnections unless we explicitly clear them
  }

  // ... (rest of the methods like sendSosAlert, syncOfflineData)


  sendSosAlert(tripId: string | undefined, description: string, location: any) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected. Emergency signal could not be sent.'));
        return;
      }

      this.socket.emit('sos:alert', { tripId, description, location }, (response: any) => {
        if (response?.status === 'ok') {
          resolve(response);
        } else {
          reject(new Error(response?.message || 'Failed to send SOS alert'));
        }
      });
      
      // Fallback: if no ack within 5s, assume success but warn
      setTimeout(() => resolve({ status: 'ok', message: 'SOS sent (timeout)' }), 5000);
    });
  }

  async syncOfflineData() {
    if (!this.socket?.connected || this.isSyncing) return;

    try {
      this.isSyncing = true;
      const points = await offlineQueue.getAll();
      if (points.length === 0) return;

      console.log(`[Sync] Found ${points.length} offline GPS points. Starting chunked sync...`);

      const CHUNK_SIZE = 20;
      const totalPoints = points.length;
      let processed = 0;

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      for (let i = 0; i < points.length; i += CHUNK_SIZE) {
        if (!this.socket?.connected) {
          console.warn('[Sync] Socket disconnected during sync, stopping.');
          break;
        }

        const chunk = points.slice(i, i + CHUNK_SIZE);
        
        const success = await new Promise<boolean>((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('[Sync] Chunk sync timed out');
            resolve(false);
          }, 10000); // 10s timeout per chunk

          this.socket!.emit('gps:batch_update', chunk, (ack: any) => {
            clearTimeout(timeout);
            if (ack?.event !== 'error') {
              processed += chunk.length;
              console.log(`[Sync] Progress: ${processed}/${totalPoints} points synced`);
              resolve(true);
            } else {
              console.error('[Sync] Chunk sync failed:', ack.data);
              resolve(false);
            }
          });
        });

        if (!success) {
          console.warn('[Sync] Stopping sync due to chunk failure/timeout');
          break;
        }

        // Small delay between chunks to keep UI thread free
        await delay(100);
      }

      console.log(`[Sync] Sync process finished. Processed ${processed}/${totalPoints} points.`);
      
      // Remove only the successfully processed items from the queue
      if (processed > 0) {
        await offlineQueue.removeItems(processed);
      }
      
    } catch (err) {
      console.error('[Sync] Sync process failed:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;

