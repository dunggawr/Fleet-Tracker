import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { socketService } from './socket';
import { useTripStore } from '../store/useTripStore';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location) {
      const { activeTrip } = useTripStore.getState();
      
      if (activeTrip) {
        // Connect if not connected (background task might run when app is killed)
        socketService.connect();
        
        socketService.emit('location:update', {
          tripId: activeTrip.id,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          heading: location.coords.heading,
          speed: location.coords.speed,
          timestamp: location.timestamp,
        });
      }
    }
  }
});

export const startBackgroundLocation = async () => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status === 'granted') {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000,
      distanceInterval: 20,
      foregroundService: {
        notificationTitle: 'Fleet Tracker is active',
        notificationBody: 'Your location is being tracked for the current trip',
        notificationColor: '#6366f1',
      },
    });
  }
};

export const stopBackgroundLocation = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
};
