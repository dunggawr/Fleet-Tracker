import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@fleet_gps_queue';

export interface GpsPoint {
  tripId: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: string;
}

let memoryQueue: GpsPoint[] | null = null;

export const offlineQueue = {
  async getQueue(): Promise<GpsPoint[]> {
    if (memoryQueue !== null) return memoryQueue;
    
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      memoryQueue = data ? JSON.parse(data) : [];
      return memoryQueue || [];
    } catch (e) {
      console.error('Failed to read offline queue', e);
      memoryQueue = [];
      return [];
    }
  },

  async push(point: GpsPoint) {
    try {
      const queue = await this.getQueue();
      queue.push(point);
      
      // Limit queue size to 1000 points
      if (queue.length > 1000) {
        memoryQueue = queue.slice(-1000);
      } else {
        memoryQueue = queue;
      }

      // Persist to storage asynchronously without blocking the caller
      // Use fire-and-forget for persistence to keep GPS tracking smooth
      AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(memoryQueue)).catch(err => 
        console.error('Failed to persist offline queue', err)
      );
    } catch (e) {
      console.error('Failed to push to offline queue', e);
    }
  },

  async getAll(): Promise<GpsPoint[]> {
    return this.getQueue();
  },

  async clear() {
    try {
      memoryQueue = [];
      await AsyncStorage.removeItem(QUEUE_KEY);
    } catch (e) {
      console.error('Failed to clear offline queue', e);
    }
  }
};
