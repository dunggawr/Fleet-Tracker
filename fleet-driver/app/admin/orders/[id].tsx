import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Package, 
  MapPin, 
  Scale, 
  Clock, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock3,
  ChevronRight
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useOrderStore, OrderStatus, Order } from '../../../store/useOrderStore';
import { OrderForm } from '../../../components/admin/OrderForm';
import { MapComponent, MarkerComponent, PolylineComponent, PROVIDER_GOOGLE } from '../../../components/map/MapComponents';

const STATUS_CONFIG = {
  [OrderStatus.PENDING]: { label: 'Pending', color: '#f59e0b', icon: Clock3 },
  [OrderStatus.ASSIGNED]: { label: 'Assigned', color: '#6366f1', icon: Package },
  [OrderStatus.PICKED_UP]: { label: 'Picked Up', color: '#8b5cf6', icon: MapPin },
  [OrderStatus.DELIVERING]: { label: 'Delivering', color: '#0ea5e9', icon: MapPin },
  [OrderStatus.DELIVERED]: { label: 'Delivered', color: '#10b981', icon: CheckCircle2 },
  [OrderStatus.FAILED]: { label: 'Failed', color: '#ef4444', icon: AlertCircle },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', color: '#94a3b8', icon: XCircle },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getOrderById, updateOrder, deleteOrder, loading } = useOrderStore();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      const data = getOrderById(id as string);
      setOrder(data);
    }
  }, [id, getOrderById]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Order",
      "Are you sure you want to delete this order? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteOrder(order.id);
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const handleUpdate = async (data: Partial<Order>) => {
    try {
      await updateOrder(order.id, data);
      setIsEditing(false);
      Alert.alert("Success", "Order updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              await updateOrder(order.id, { status: OrderStatus.CANCELLED });
              setOrder(prev => prev ? { ...prev, status: OrderStatus.CANCELLED } : undefined);
              Alert.alert("Success", "Order cancelled successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG[OrderStatus.PENDING];
  const StatusIcon = statusConfig.icon;
  const canCancel = order.status === OrderStatus.PENDING || order.status === OrderStatus.ASSIGNED;

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Order</Text>
        </View>
        <OrderForm 
          initialData={order} 
          onSubmit={handleUpdate} 
          loading={loading} 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Detail</Text>
        <View style={styles.headerActions}>
          {canCancel && (
            <TouchableOpacity onPress={handleCancel} style={styles.actionIcon}>
              <XCircle size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.actionIcon}>
            <Edit3 size={20} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionIcon}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <MapComponent
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: (order.pickupLocation.coordinates[1] + order.deliveryLocation.coordinates[1]) / 2,
              longitude: (order.pickupLocation.coordinates[0] + order.deliveryLocation.coordinates[0]) / 2,
              latitudeDelta: Math.abs(order.pickupLocation.coordinates[1] - order.deliveryLocation.coordinates[1]) * 1.5 || 0.05,
              longitudeDelta: Math.abs(order.pickupLocation.coordinates[0] - order.deliveryLocation.coordinates[0]) * 1.5 || 0.05,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <MarkerComponent
              coordinate={{
                latitude: order.pickupLocation.coordinates[1],
                longitude: order.pickupLocation.coordinates[0],
              }}
              title="Pickup"
              pinColor="#f59e0b"
            />
            <MarkerComponent
              coordinate={{
                latitude: order.deliveryLocation.coordinates[1],
                longitude: order.deliveryLocation.coordinates[0],
              }}
              title="Delivery"
              pinColor="#10b981"
            />
            <PolylineComponent
              coordinates={[
                { latitude: order.pickupLocation.coordinates[1], longitude: order.pickupLocation.coordinates[0] },
                { latitude: order.deliveryLocation.coordinates[1], longitude: order.deliveryLocation.coordinates[0] }
              ]}
              strokeColor="#6366f1"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          </MapComponent>
          <BlurView intensity={20} tint="dark" style={styles.mapOverlay}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}CC` }]}>
              <StatusIcon size={16} color="#fff" />
              <Text style={styles.statusBadgeText}>{statusConfig.label}</Text>
            </View>
          </BlurView>
        </View>

        {/* Info Sections */}
        <View style={styles.contentContainer}>
          <View style={styles.idCard}>
            <Text style={styles.idLabel}>ORDER REFERENCE</Text>
            <Text style={styles.idText}>{order.id.toUpperCase()}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#6366f1" />
              <Text style={styles.sectionTitle}>Route Details</Text>
            </View>
            
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: '#f59e0b' }]} />
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Pickup Address</Text>
                <Text style={styles.routeValue}>{order.pickupAddress}</Text>
              </View>
            </View>
            
            <View style={styles.routeLine} />
            
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: '#10b981' }]} />
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Delivery Address</Text>
                <Text style={styles.routeValue}>{order.deliveryAddress}</Text>
              </View>
            </View>
          </View>

          <View style={styles.twoColumn}>
            <View style={styles.sectionSmall}>
              <View style={styles.sectionHeader}>
                <Scale size={18} color="#6366f1" />
                <Text style={styles.sectionTitleSmall}>Weight</Text>
              </View>
              <Text style={styles.valueLarge}>{order.weightKg} kg</Text>
            </View>

            <View style={styles.sectionSmall}>
              <View style={styles.sectionHeader}>
                <Calendar size={18} color="#6366f1" />
                <Text style={styles.sectionTitleSmall}>Date</Text>
              </View>
              <Text style={styles.valueLarge}>
                {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {order.description && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Package size={20} color="#6366f1" />
                <Text style={styles.sectionTitle}>Instructions</Text>
              </View>
              <Text style={styles.descriptionText}>{order.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#6366f1" />
              <Text style={styles.sectionTitle}>Timeline</Text>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelinePoint} />
              <Text style={styles.timelineText}>Order created on {new Date(order.createdAt).toLocaleString()}</Text>
            </View>
            {order.updatedAt !== order.createdAt && (
              <View style={styles.timelineItem}>
                <View style={styles.timelinePoint} />
                <Text style={styles.timelineText}>Last updated on {new Date(order.updatedAt).toLocaleString()}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mapContainer: {
    height: 200,
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  contentContainer: {
    padding: 20,
    gap: 20,
  },
  idCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  idLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  idText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  routeItem: {
    flexDirection: 'row',
    gap: 16,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  routeValue: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 5,
    marginVertical: 4,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 16,
  },
  sectionSmall: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionTitleSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  valueLarge: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  descriptionText: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  timelinePoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366f1',
  },
  timelineText: {
    color: '#64748b',
    fontSize: 13,
  },
});
