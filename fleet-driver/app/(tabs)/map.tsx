import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Navigation, MapPin, Truck, CheckCircle2, Phone, AlertTriangle } from 'lucide-react-native';
import { useTripStore, TripStatus } from '../../store/useTripStore';
import { socketService } from '../../lib/socket';

const { width, height } = Dimensions.get('window');

export default function ActiveTripMap() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { activeTrip, updateTripStatus } = useTripStore();
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Connect to socket when map loads
      socketService.connect();
    })();

    // Subscribe to location updates
    const subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (newLocation) => {
        setLocation(newLocation);
        // Emit location to socket
        if (activeTrip) {
          socketService.emit('location:update', {
            tripId: activeTrip.id,
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            heading: newLocation.coords.heading,
            speed: newLocation.coords.speed,
          });
        }
      }
    );

    return () => {
      subscription.then(sub => sub.remove());
    };
  }, [activeTrip]);

  const handleStatusUpdate = (newStatus: TripStatus) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to change status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            updateTripStatus(newStatus);
            socketService.emit('trip:status_change', {
              tripId: activeTrip?.id,
              status: newStatus
            });
          }
        },
      ]
    );
  };

  const centerOnLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  if (!activeTrip) {
    return (
      <View style={styles.emptyContainer}>
        <Truck size={64} color="#334155" />
        <Text style={styles.emptyTitle}>No Active Trip</Text>
        <Text style={styles.emptySubtitle}>Go to the Trips tab to accept a new assignment</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.coords.latitude || 21.0285,
          longitude: location?.coords.longitude || 105.8542,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={darkMapStyle}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Position"
          >
            <View style={styles.driverMarker}>
              <View style={styles.driverMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Example waypoints */}
        <Marker
          coordinate={{ latitude: 21.03, longitude: 105.86 }}
          title="Pickup: Warehouse A"
          pinColor="#6366f1"
        />
        
        {activeTrip.orders.map((order, index) => (
          <Marker
            key={order.id}
            coordinate={{ latitude: 21.04 + (index * 0.01), longitude: 105.87 + (index * 0.01) }}
            title={`Delivery: ${order.customerName}`}
            pinColor="#10b981"
          />
        ))}
      </MapView>

      <View style={styles.topOverlay}>
        <View style={styles.tripInfoCard}>
          <View style={styles.tripInfoMain}>
            <Text style={styles.tripIdText}>Trip: {activeTrip.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activeTrip.status) }]}>
              <Text style={styles.statusText}>{activeTrip.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.etaText}>ETA: 25 mins • 4.2 km left</Text>
        </View>
      </View>

      <View style={styles.bottomOverlay}>
        <TouchableOpacity style={styles.locationButton} onPress={centerOnLocation}>
          <Navigation size={24} color="#f8fafc" />
        </TouchableOpacity>

        <View style={styles.actionsCard}>
          <View style={styles.nextStopInfo}>
            <MapPin size={24} color="#10b981" />
            <View style={styles.stopTextContainer}>
              <Text style={styles.stopLabel}>Next Stop</Text>
              <Text style={styles.stopAddress}>{activeTrip.orders[0].address}</Text>
            </View>
            <TouchableOpacity style={styles.callButton}>
              <Phone size={20} color="#6366f1" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            {activeTrip.status === TripStatus.ASSIGNED && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#6366f1' }]}
                onPress={() => handleStatusUpdate(TripStatus.STARTED)}
              >
                <Truck size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Start Trip</Text>
              </TouchableOpacity>
            )}

            {activeTrip.status === TripStatus.STARTED && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                onPress={() => handleStatusUpdate(TripStatus.PICKED_UP)}
              >
                <Truck size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Arrived at Pickup</Text>
              </TouchableOpacity>
            )}

            {(activeTrip.status === TripStatus.PICKED_UP || activeTrip.status === TripStatus.DELIVERING) && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                onPress={() => handleStatusUpdate(TripStatus.COMPLETED)}
              >
                <CheckCircle2 size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Delivered</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.sosButton}>
              <AlertTriangle size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const getStatusColor = (status: TripStatus) => {
  switch (status) {
    case TripStatus.ASSIGNED: return '#6366f1';
    case TripStatus.STARTED: return '#3b82f6';
    case TripStatus.PICKED_UP: return '#f59e0b';
    case TripStatus.DELIVERING: return '#10b981';
    default: return '#64748b';
  }
};

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  map: {
    width: width,
    height: height,
  },
  topOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  tripInfoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tripInfoMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripIdText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  etaText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  locationButton: {
    backgroundColor: '#1e293b',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  actionsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  nextStopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  stopTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  stopLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  stopAddress: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  callButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sosButton: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  driverMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});
