import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapComponent, PROVIDER_GOOGLE } from '../../components/map/MapComponents';
import { FleetMarker } from '../../components/map/FleetMarker';
import { useFleetTrackingStore, TrackedVehicle } from '../../store/useFleetTrackingStore';
import { Map as MapIcon, Layers, Maximize, Search, Truck, User, Navigation } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function AdminTrackingScreen() {
  const mapRef = useRef<any>(null);
  const { vehicles, isLoading, fetchLiveLocations, startTracking, stopTracking } = useFleetTrackingStore();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  const vehicleList = useMemo(() => Object.values(vehicles), [vehicles]);
  const selectedVehicle = selectedVehicleId ? vehicles[selectedVehicleId] : null;

  useEffect(() => {
    fetchLiveLocations();
    startTracking();
    return () => stopTracking();
  }, []);

  const fitFleet = () => {
    if (vehicleList.length === 0 || !mapRef.current) return;
    
    const coords = vehicleList.map(v => ({
      latitude: v.latitude,
      longitude: v.longitude,
    }));

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
      animated: true,
    });
  };

  const toggleMapType = () => {
    const types: ('standard' | 'satellite' | 'hybrid')[] = ['standard', 'satellite', 'hybrid'];
    const nextIndex = (types.indexOf(mapType) + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <MapComponent
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        mapType={mapType}
        initialRegion={{
          latitude: 10.762622,
          longitude: 106.660172,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onPress={() => setSelectedVehicleId(null)}
      >
        {vehicleList.map((vehicle) => (
          <FleetMarker 
            key={vehicle.id} 
            vehicle={vehicle} 
            onPress={(v) => setSelectedVehicleId(v.id)}
          />
        ))}
      </MapComponent>

      {/* Floating Header */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <BlurView intensity={80} tint="dark" style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <View style={styles.liveIndicator} />
            <Text style={styles.headerTitle}>Fleet Live</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {vehicleList.length} active vehicles
          </Text>
        </BlurView>

        {/* Map Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
            <Layers size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={fitFleet}>
            <Maximize size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Selected Vehicle Card */}
        {selectedVehicle && (
          <BlurView intensity={95} tint="dark" style={styles.detailCard}>
            <View style={styles.cardHeader}>
              <View style={styles.vehicleInfo}>
                <View style={[styles.statusIcon, { backgroundColor: getStatusColor(selectedVehicle.status) }]} />
                <Text style={styles.plateText}>{selectedVehicle.licensePlate}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedVehicleId(null)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.dataRow}>
                <View style={styles.dataItem}>
                  <User size={16} color="#94a3b8" />
                  <Text style={styles.dataValue}>{selectedVehicle.driverName}</Text>
                </View>
                <View style={styles.dataItem}>
                  <Navigation size={16} color="#94a3b8" />
                  <Text style={styles.dataValue}>{selectedVehicle.speed} km/h</Text>
                </View>
              </View>

              <View style={styles.dataRow}>
                <View style={styles.dataItem}>
                  <Truck size={16} color="#94a3b8" />
                  <Text style={styles.dataValue}>{selectedVehicle.status.replace('_', ' ').toUpperCase()}</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.timeLabel}>Last update: </Text>
                  <Text style={styles.dataValue}>Just now</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>
          </BlurView>
        )}

        {isLoading && vehicleList.length === 0 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Connecting to fleet...</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return '#10b981';
    case 'on_trip': return '#6366f1';
    case 'maintenance': return '#f59e0b';
    default: return '#64748b';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
  },
  header: {
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  controlsContainer: {
    position: 'absolute',
    right: 16,
    top: 120,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailCard: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  plateText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  closeText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  cardContent: {
    gap: 12,
    marginBottom: 20,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dataValue: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '500',
  },
  timeLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});
