import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MapPin, Calendar, Clock, ChevronLeft, Package, User } from 'lucide-react-native';
import { useTripStore } from '../../store/useTripStore';

export default function TripDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { tripHistory } = useTripStore();
  
  const trip = tripHistory.find(t => t.id === id);

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Trip Details',
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
        )
      }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.tripId}>#{trip.id}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{trip.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Calendar size={20} color="#94a3b8" />
            <Text style={styles.infoText}>{new Date(trip.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={20} color="#94a3b8" />
            <Text style={styles.infoText}>{new Date(trip.createdAt).toLocaleTimeString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Orders ({trip.orders.length})</Text>
        {trip.orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Package size={20} color="#6366f1" />
              <Text style={styles.customerName}>{order.customerName}</Text>
            </View>
            <View style={styles.addressContainer}>
              <MapPin size={16} color="#ef4444" />
              <Text style={styles.addressText}>{order.address}</Text>
            </View>
            <View style={styles.orderFooter}>
              <View style={[styles.miniBadge, { backgroundColor: order.status === 'delivered' ? '#10b981' : '#f59e0b' }]}>
                <Text style={styles.miniBadgeText}>{order.status}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Trip Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Distance</Text>
            <Text style={styles.summaryValue}>{trip.totalDistanceKm} km</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fuel Consumption</Text>
            <Text style={styles.summaryValue}>~{(trip.totalDistanceKm * 0.1).toFixed(1)} L</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tripId: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    color: '#f8fafc',
    fontSize: 16,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  orderCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  customerName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  addressText: {
    color: '#94a3b8',
    fontSize: 14,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryCard: {
    marginTop: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  summaryTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  summaryValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 100,
  }
});
