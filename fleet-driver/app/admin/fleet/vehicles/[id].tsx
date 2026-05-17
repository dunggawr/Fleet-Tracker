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
  Truck,
  Settings2,
  Scale,
  User as UserIcon,
  Activity,
  Box
} from 'lucide-react-native';
import { useFleetStore, Vehicle, VehicleStatus, VehicleType } from '../../../../store/useFleetStore';
import { VehicleForm } from '../../../../components/admin/VehicleForm';

const STATUS_CONFIG = {
  [VehicleStatus.AVAILABLE]: { label: 'Available', color: '#10b981' },
  [VehicleStatus.DELIVERING]: { label: 'Delivering', color: '#6366f1' },
  [VehicleStatus.MAINTENANCE]: { label: 'Maintenance', color: '#ef4444' },
};

const TYPE_LABELS = {
  [VehicleType.SMALL]: 'Small Van',
  [VehicleType.MEDIUM]: 'Box Truck',
  [VehicleType.LARGE]: 'Semi Truck',
};

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { vehicles, loading, updateVehicle, deleteVehicle, createVehicle } = useFleetStore();
  
  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(id === 'create');

  useEffect(() => {
    if (id && id !== 'create') {
      const found = vehicles.find(v => v.id === id);
      setVehicle(found);
    }
  }, [id, vehicles]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to remove this vehicle from the fleet?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVehicle(id as string);
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async (data: any) => {
    try {
      if (id === 'create') {
        await createVehicle(data);
        Alert.alert("Success", "Vehicle created successfully");
      } else {
        await updateVehicle(id as string, data);
        Alert.alert("Success", "Vehicle updated successfully");
        setIsEditing(false);
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading && !vehicle && id !== 'create') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading vehicle info...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!vehicle && id !== 'create') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Vehicle not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={{ color: '#6366f1' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = vehicle ? (STATUS_CONFIG[vehicle.status] || STATUS_CONFIG[VehicleStatus.AVAILABLE]) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{id === 'create' ? 'New Vehicle' : 'Vehicle Detail'}</Text>
        {id !== 'create' && (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.actionIcon}>
              <Edit3 size={20} color={isEditing ? '#10b981' : '#6366f1'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionIcon}>
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isEditing ? (
        <VehicleForm 
          initialData={vehicle}
          onSubmit={handleSubmit}
          loading={loading}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <View style={[styles.avatarLarge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Truck size={48} color="#10b981" />
            </View>
            <Text style={styles.nameTextLarge}>{vehicle?.plateNumber}</Text>
            {status && (
              <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              
              <View style={styles.infoRow}>
                <Box size={20} color="#64748b" />
                <View>
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>{vehicle ? TYPE_LABELS[vehicle.type] : 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Scale size={20} color="#64748b" />
                <View>
                  <Text style={styles.infoLabel}>Max Capacity</Text>
                  <Text style={styles.infoValue}>{vehicle?.maxCapacityKg} kg</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assigned Driver</Text>
              
              <View style={styles.infoRow}>
                <UserIcon size={20} color="#64748b" />
                <View>
                  <Text style={styles.infoLabel}>Driver Name</Text>
                  <Text style={styles.infoValue}>{vehicle?.driver?.user.fullName || 'Unassigned'}</Text>
                </View>
              </View>

              {vehicle?.driver && (
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => router.push(`/admin/fleet/drivers/${vehicle.driverId}` as any)}
                >
                  <Text style={styles.viewButtonText}>View Driver Profile</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vehicle Health</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>Good</Text>
                  <Text style={styles.statLabel}>Condition</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>85%</Text>
                  <Text style={styles.statLabel}>Fuel</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>1.2k</Text>
                  <Text style={styles.statLabel}>KM this month</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '700',
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  nameTextLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  contentContainer: {
    padding: 20,
    gap: 20,
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#f8fafc',
    fontWeight: '700',
  },
  viewButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewButtonText: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 'bold',
    marginTop: 4,
  },
});
