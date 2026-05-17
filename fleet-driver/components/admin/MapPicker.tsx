import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MapComponent, MarkerComponent, PROVIDER_GOOGLE } from '../map/MapComponents';
import { MapPin, Check, X, Target } from 'lucide-react-native';
import * as Location from 'expo-location';
import { BlurView } from 'expo-blur';

interface MapPickerProps {
  initialLocation?: { latitude: number; longitude: number };
  onSelect: (location: { latitude: number; longitude: number }) => void;
  onCancel: () => void;
  title: string;
}

export const MapPicker: React.FC<MapPickerProps> = ({ 
  initialLocation, 
  onSelect, 
  onCancel,
  title 
}) => {
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 10.762622,
    longitude: initialLocation?.longitude || 106.660172,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || { latitude: 10.762622, longitude: 106.660172 }
  );

  const mapRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      if (!initialLocation) {
        const newLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setSelectedLocation(newLoc);
        setRegion({
          ...region,
          ...newLoc,
        });
        mapRef.current?.animateToRegion({
          ...region,
          ...newLoc,
        }, 500);
      }
    })();
  }, []);

  const handleCenter = async () => {
    let location = await Location.getCurrentPositionAsync({});
    const newLoc = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    mapRef.current?.animateToRegion({
      ...region,
      ...newLoc,
    }, 500);
  };

  return (
    <View style={styles.container}>
      <MapComponent
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={(r) => {
          setRegion(r);
          setSelectedLocation({
            latitude: r.latitude,
            longitude: r.longitude,
          });
        }}
      >
        <MarkerComponent
          coordinate={selectedLocation}
          pinColor="#6366f1"
        />
      </MapComponent>

      {/* Floating Center Icon (Like Uber/Grab) */}
      <View style={styles.centerMarkerContainer} pointerEvents="none">
        <MapPin size={40} color="#6366f1" strokeWidth={2.5} />
      </View>

      <View style={styles.overlay}>
        <BlurView intensity={60} tint="dark" style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSub}>Move the map to set location</Text>
        </BlurView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.centerButton} 
            onPress={handleCenter}
          >
            <Target size={24} color="#6366f1" />
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <X size={20} color="#f8fafc" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={() => onSelect(selectedLocation)}
            >
              <Check size={20} color="#fff" />
              <Text style={styles.buttonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40, // Adjust for pin height
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  centerButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#1e293b',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButton: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
