import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Truck, User as UserIcon, Settings2, ChevronRight } from 'lucide-react-native';
import { Vehicle, VehicleStatus, VehicleType } from '../../store/useFleetStore';

const VEHICLE_STATUS_CONFIG = {
  [VehicleStatus.AVAILABLE]: { label: 'Available', color: '#10b981' },
  [VehicleStatus.DELIVERING]: { label: 'Delivering', color: '#6366f1' },
  [VehicleStatus.MAINTENANCE]: { label: 'Maintenance', color: '#ef4444' },
};

const VEHICLE_TYPE_LABELS = {
  [VehicleType.SMALL]: 'Small Van',
  [VehicleType.MEDIUM]: 'Box Truck',
  [VehicleType.LARGE]: 'Semi Truck',
};

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => {
  const status = VEHICLE_STATUS_CONFIG[vehicle.status] || VEHICLE_STATUS_CONFIG[VehicleStatus.AVAILABLE];
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
          <Truck size={24} color="#10b981" />
        </View>
        <View style={styles.mainInfo}>
          <Text style={styles.nameText}>{vehicle.plateNumber}</Text>
          <Text style={styles.subText}>{VEHICLE_TYPE_LABELS[vehicle.type]}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Settings2 size={16} color="#94a3b8" />
          <Text style={styles.footerText}>{vehicle.maxCapacityKg}kg</Text>
        </View>
        <View style={styles.footerItem}>
          <UserIcon size={16} color="#94a3b8" />
          <Text style={styles.footerText}>{vehicle.driver?.user.fullName || 'Unassigned'}</Text>
        </View>
        <ChevronRight size={20} color="#475569" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subText: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
});
