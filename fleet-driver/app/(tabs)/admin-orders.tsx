import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
  ScrollView
} from 'react-native';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Scale,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock3
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useOrderStore, OrderStatus, Order } from '../../store/useOrderStore';

const STATUS_CONFIG = {
  [OrderStatus.PENDING]: { label: 'Pending', color: '#f59e0b', icon: Clock3 },
  [OrderStatus.ASSIGNED]: { label: 'Assigned', color: '#6366f1', icon: Package },
  [OrderStatus.PICKED_UP]: { label: 'Picked Up', color: '#8b5cf6', icon: MapPin },
  [OrderStatus.DELIVERING]: { label: 'Delivering', color: '#0ea5e9', icon: MapPin },
  [OrderStatus.DELIVERED]: { label: 'Delivered', color: '#10b981', icon: CheckCircle2 },
  [OrderStatus.FAILED]: { label: 'Failed', color: '#ef4444', icon: AlertCircle },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', color: '#94a3b8', icon: XCircle },
};

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { orders, loading, fetchOrders } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const id = order?.id || '';
      const pickupAddress = order?.pickupAddress || '';
      const deliveryAddress = order?.deliveryAddress || '';
      const matchesSearch = 
        id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, selectedStatus]);

  const renderOrderCard = ({ item }: { item: Order }) => {
    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG[OrderStatus.PENDING];
    const StatusIcon = config.icon;

    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => router.push({
          pathname: '/admin/orders/[id]',
          params: { id: item.id }
        })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.orderIdGroup}>
            <Text style={styles.orderIdLabel}>ORDER ID</Text>
            <Text style={styles.orderIdText}>#{item.id.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}>
            <StatusIcon size={14} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <View style={styles.addressContainer}>
          <View style={styles.addressLine}>
            <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.addressText} numberOfLines={1}>{item.pickupAddress}</Text>
          </View>
          <View style={styles.connector} />
          <View style={styles.addressLine}>
            <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.addressText} numberOfLines={1}>{item.deliveryAddress}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Scale size={16} color="#94a3b8" />
            <Text style={styles.footerText}>{item.weightKg} kg</Text>
          </View>
          <View style={styles.footerItem}>
            <Clock size={16} color="#94a3b8" />
            <Text style={styles.footerText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <ChevronRight size={20} color="#475569" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Logistics</Text>
          <Text style={styles.title}>Order Fleet</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/admin/orders/create')}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <BlurView intensity={40} tint="dark" style={styles.searchBlur}>
          <Search size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            placeholder="Search orders, addresses..."
            placeholderTextColor="#64748b"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </BlurView>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, selectedStatus === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={[styles.filterChipText, selectedStatus === 'all' && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <TouchableOpacity 
              key={status}
              style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
              onPress={() => setSelectedStatus(status as OrderStatus)}
            >
              <Text style={[styles.filterChipText, selectedStatus === status && styles.filterChipTextActive]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchOrders} 
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Package size={64} color="#1e293b" />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySub}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 40 }} />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterChipText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // For tab bar
  },
  orderCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderIdGroup: {
    gap: 2,
  },
  orderIdLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  orderIdText: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addressContainer: {
    marginBottom: 20,
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addressText: {
    color: '#cbd5e1',
    fontSize: 14,
    flex: 1,
  },
  connector: {
    width: 2,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 3,
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    gap: 16,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptySub: {
    color: '#64748b',
    fontSize: 16,
  },
});
