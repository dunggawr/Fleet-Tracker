import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MarkerComponent } from './MapComponents';
import { Truck } from 'lucide-react-native';
import { TrackedVehicle } from '@/store/useFleetTrackingStore';

interface FleetMarkerProps {
  vehicle: TrackedVehicle;
  onPress?: (vehicle: TrackedVehicle) => void;
}

export const FleetMarker = memo(({ vehicle, onPress }: FleetMarkerProps) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [vehicle.latitude, vehicle.longitude, vehicle.status, vehicle.heading]);

  const getStatusColor = () => {
    switch (vehicle.status) {
      case 'available': return '#10b981'; // Green
      case 'on_trip': return '#6366f1'; // Indigo
      case 'maintenance': return '#f59e0b'; // Orange
      default: return '#64748b'; // Slate/Grey
    }
  };

  const statusColor = getStatusColor();

  return (
    <MarkerComponent
      coordinate={{
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
      }}
      onPress={() => onPress?.(vehicle)}
      rotation={vehicle.heading}
      anchor={{ x: 0.5, y: 1.0 }}
      tracksViewChanges={tracksViewChanges}
    >
      <View style={[styles.markerContainer, { borderColor: statusColor }]}>
        <View style={[styles.iconWrapper, { backgroundColor: statusColor }]}>
          <Truck size={14} color="#fff" strokeWidth={3} />
        </View>
        <View style={styles.plateContainer}>
          <Text style={styles.plateText}>{vehicle.licensePlate}</Text>
        </View>
        <View style={[styles.arrow, { borderTopColor: statusColor }]} />
      </View>
    </MarkerComponent>
  );
}, (prev, next) => {
  return (
    prev.vehicle.latitude === next.vehicle.latitude &&
    prev.vehicle.longitude === next.vehicle.longitude &&
    prev.vehicle.heading === next.vehicle.heading &&
    prev.vehicle.status === next.vehicle.status &&
    prev.vehicle.licensePlate === next.vehicle.licensePlate
  );
});

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    padding: 4,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  plateContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  plateText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  }
});
