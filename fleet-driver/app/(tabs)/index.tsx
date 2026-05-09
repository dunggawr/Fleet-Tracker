import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Truck, MapPin, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useTripStore, TripStatus } from '../../store/useTripStore';

export default function TripsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { pendingTrips, activeTrip, setPendingTrips, setActiveTrip } = useTripStore();
  const router = useRouter();

  const fetchTrips = async () => {
    setIsLoading(true);
    // Mock API fetch
    setTimeout(() => {
      setPendingTrips([
        {
          id: 'T-1001',
          vehicleId: 'V-01',
          driverId: 'D-01',
          status: TripStatus.ASSIGNED,
          totalDistanceKm: 12.5,
          createdAt: new Date().toISOString(),
          orders: [
            { id: 'O-1', customerName: 'John Doe', address: '123 Main St', status: 'pending' },
            { id: 'O-2', customerName: 'Jane Smith', address: '456 Oak Ave', status: 'pending' },
          ]
        }
      ]);
      setIsLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  const handleAcceptTrip = (trip: any) => {
    setActiveTrip(trip);
    // Remove from pending
    setPendingTrips(pendingTrips.filter(t => t.id !== trip.id));
    router.push('/(tabs)/map');
  };

  const renderTripCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.tripIdBadge}>
          <Text style={styles.tripIdText}>{item.id}</Text>
        </View>
        <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.routeInfo}>
          <View style={styles.iconColumn}>
            <MapPin size={20} color="#6366f1" />
            <View style={styles.dotLine} />
            <MapPin size={20} color="#10b981" />
          </View>
          <View style={styles.addressColumn}>
            <Text style={styles.addressText} numberOfLines={1}>Warehouse Alpha</Text>
            <Text style={styles.addressSubtext}>Pickup Point</Text>
            <View style={styles.spacer} />
            <Text style={styles.addressText} numberOfLines={1}>{item.orders[item.orders.length - 1].address}</Text>
            <Text style={styles.addressSubtext}>Final Delivery</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Truck size={16} color="#94a3b8" />
            <Text style={styles.statLabel}>{item.orders.length} Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={16} color="#94a3b8" />
            <Text style={styles.statLabel}>{item.totalDistanceKm} km</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.acceptButton}
        onPress={() => handleAcceptTrip(item)}
      >
        <Text style={styles.acceptButtonText}>Accept Trip</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Trips</Text>
        <Text style={styles.headerSubtitle}>New assignments will appear here</Text>
      </View>

      {activeTrip && (
        <TouchableOpacity 
          style={styles.activeTripBanner}
          onPress={() => router.push('/(tabs)/map')}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerIcon}>
              <ActivityIndicator size="small" color="#6366f1" />
            </View>
            <View>
              <Text style={styles.bannerTitle}>Active Trip: {activeTrip.id}</Text>
              <Text style={styles.bannerSubtitle}>Tap to continue delivery</Text>
            </View>
          </View>
          <ChevronRight color="#6366f1" />
        </TouchableOpacity>
      )}

      {isLoading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={pendingTrips}
          renderItem={renderTripCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AlertCircle size={48} color="#334155" />
              <Text style={styles.emptyText}>No trips assigned at the moment</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  activeTripBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    margin: 20,
    marginTop: 0,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    marginRight: 12,
  },
  bannerTitle: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bannerSubtitle: {
    color: '#6366f1',
    fontSize: 12,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tripIdBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tripIdText: {
    color: '#6366f1',
    fontWeight: 'bold',
    fontSize: 12,
  },
  timeText: {
    color: '#64748b',
    fontSize: 12,
  },
  cardBody: {
    marginBottom: 20,
  },
  routeInfo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  iconColumn: {
    alignItems: 'center',
    width: 20,
    marginRight: 15,
  },
  dotLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    marginVertical: 4,
  },
  addressColumn: {
    flex: 1,
  },
  addressText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '500',
  },
  addressSubtext: {
    color: '#64748b',
    fontSize: 12,
  },
  spacer: {
    height: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: '#6366f1',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#64748b',
    marginTop: 15,
    fontSize: 16,
  },
});
