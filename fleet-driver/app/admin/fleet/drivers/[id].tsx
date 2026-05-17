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
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Activity,
  Calendar
} from 'lucide-react-native';
import { useFleetStore, Driver, DriverStatus } from '../../../../store/useFleetStore';
import { DriverForm } from '../../../../components/admin/DriverForm';

const STATUS_CONFIG = {
  [DriverStatus.AVAILABLE]: { label: 'Available', color: '#10b981' },
  [DriverStatus.ON_TRIP]: { label: 'On Trip', color: '#6366f1' },
  [DriverStatus.OFF_DUTY]: { label: 'Off Duty', color: '#94a3b8' },
};

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { drivers, loading, updateDriver, deleteDriver, createDriver } = useFleetStore();
  
  const [driver, setDriver] = useState<Driver | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(id === 'create');

  useEffect(() => {
    if (id && id !== 'create') {
      const found = drivers.find(d => d.id === id);
      setDriver(found);
    }
  }, [id, drivers]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Driver",
      "Are you sure you want to remove this driver from the fleet?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDriver(id as string);
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
        await createDriver(data);
        Alert.alert("Success", "Driver created successfully");
      } else {
        await updateDriver(id as string, data);
        Alert.alert("Success", "Driver updated successfully");
        setIsEditing(false);
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading && !driver && id !== 'create') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading driver info...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!driver && id !== 'create') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Driver not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={{ color: '#6366f1' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = driver ? (STATUS_CONFIG[driver.status] || STATUS_CONFIG[DriverStatus.OFF_DUTY]) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{id === 'create' ? 'New Driver' : 'Driver Detail'}</Text>
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
        <DriverForm 
          initialData={driver}
          onSubmit={handleSubmit}
          loading={loading}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <View style={styles.avatarLarge}>
              <UserIcon size={48} color="#6366f1" />
            </View>
            <Text style={styles.nameTextLarge}>{driver?.user.fullName}</Text>
            {status && (
              <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Details</Text>
              
              <View style={styles.infoRow}>
                <Mail size={20} color="#64748b" />
                <View>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{driver?.user.email}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Phone size={20} color="#64748b" />
                <View>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{driver?.user.phone || 'Not provided'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>License Information</Text>
              
              <View style={styles.infoRow}>
                <ShieldCheck size={20} color="#64748b" />
                <View>
                  <Text style={styles.infoLabel}>Class</Text>
                  <Text style={styles.infoValue}>{driver?.licenseClass || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Calendar size={20} color="#64748b" />
                <View>
                  <Text style={styles.infoLabel}>Expiry Date</Text>
                  <Text style={styles.infoValue}>{driver?.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : 'N/A'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>24</Text>
                  <Text style={styles.statLabel}>Trips</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>4.8</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>120h</Text>
                  <Text style={styles.statLabel}>On Duty</Text>
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
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
    fontSize: 20,
    fontWeight: '800',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 'bold',
    marginTop: 4,
  },
});
