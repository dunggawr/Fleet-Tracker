import React from 'react';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { MapComponent, MarkerComponent, PolylineComponent, PROVIDER_GOOGLE } from '../../map/MapComponents';
import { Order, OrderStatus } from '../../../store/useOrderStore';
import { Clock3, Package, MapPin, CheckCircle2, AlertCircle, XCircle } from 'lucide-react-native';

const STATUS_CONFIG = {
  [OrderStatus.PENDING]: { label: 'Pending', color: '#f59e0b', icon: Clock3 },
  [OrderStatus.ASSIGNED]: { label: 'Assigned', color: '#6366f1', icon: Package },
  [OrderStatus.PICKED_UP]: { label: 'Picked Up', color: '#8b5cf6', icon: MapPin },
  [OrderStatus.DELIVERING]: { label: 'Delivering', color: '#0ea5e9', icon: MapPin },
  [OrderStatus.DELIVERED]: { label: 'Delivered', color: '#10b981', icon: CheckCircle2 },
  [OrderStatus.FAILED]: { label: 'Failed', color: '#ef4444', icon: AlertCircle },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', color: '#94a3b8', icon: XCircle },
};

interface OrderDetailMapProps {
  order: Order;
}

export const OrderDetailMap: React.FC<OrderDetailMapProps> = ({ order }) => {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG[OrderStatus.PENDING];
  const StatusIcon = statusConfig.icon;

  const diffLat = Math.abs(order.pickupLocation.coordinates[1] - order.deliveryLocation.coordinates[1]);
  const diffLng = Math.abs(order.pickupLocation.coordinates[0] - order.deliveryLocation.coordinates[0]);

  // Dynamic zoom: focus closely on route streets, fallback to 0.012 instead of 0.05 for a much closer look
  const latDelta = diffLat > 0 ? Math.min(Math.max(diffLat * 1.4, 0.012), 15.0) : 0.012;
  const lngDelta = diffLng > 0 ? Math.min(Math.max(diffLng * 1.4, 0.012), 15.0) : 0.012;

  return (
    <View className="h-80 w-full overflow-hidden relative border-b border-white/5">
      <MapComponent
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: (order.pickupLocation.coordinates[1] + order.deliveryLocation.coordinates[1]) / 2,
          longitude: (order.pickupLocation.coordinates[0] + order.deliveryLocation.coordinates[0]) / 2,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
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
      
      {/* Floating Status Badge (Bottom-Left) */}
      <View 
        className="absolute bottom-4 left-4 flex-row items-center px-3 py-1.5 rounded-xl gap-2 shadow-lg shadow-black/40 border border-white/10"
        style={{ backgroundColor: `${statusConfig.color}E6` }}
      >
        <StatusIcon size={14} color="#fff" />
        <Text className="text-white font-extrabold text-xs uppercase tracking-wide">{statusConfig.label}</Text>
      </View>
    </View>
  );
};
