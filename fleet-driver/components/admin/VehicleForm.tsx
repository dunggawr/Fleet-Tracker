import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Truck, Scale, Settings2, User as UserIcon } from 'lucide-react-native';
import { Vehicle, VehicleStatus, VehicleType, useFleetStore } from '../../store/useFleetStore';

interface VehicleFormProps {
  initialData?: Vehicle;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({ initialData, onSubmit, loading }) => {
  const { drivers } = useFleetStore();
  const [formData, setFormData] = useState({
    plateNumber: initialData?.plateNumber || '',
    type: initialData?.type || VehicleType.MEDIUM,
    maxCapacityKg: initialData?.maxCapacityKg?.toString() || '3000',
    status: initialData?.status || VehicleStatus.AVAILABLE,
    driverId: initialData?.driverId || '',
  });

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      maxCapacityKg: parseInt(formData.maxCapacityKg),
      driverId: formData.driverId || null,
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          
          <View style={styles.inputGroup}>
            <Settings2 size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Plate Number"
              placeholderTextColor="#64748b"
              autoCapitalize="characters"
              value={formData.plateNumber}
              onChangeText={(text) => setFormData({ ...formData, plateNumber: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Scale size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Max Capacity (kg)"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={formData.maxCapacityKg}
              onChangeText={(text) => setFormData({ ...formData, maxCapacityKg: text })}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Type</Text>
          <View style={styles.typeContainer}>
            {Object.values(VehicleType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  formData.type === type && styles.typeButtonActive
                ]}
                onPress={() => setFormData({ ...formData, type })}
              >
                <Truck size={20} color={formData.type === type ? '#fff' : '#64748b'} />
                <Text style={[
                  styles.typeButtonText,
                  formData.type === type && styles.typeButtonTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.typeContainer}>
            {Object.values(VehicleStatus).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  formData.status === status && styles.statusButtonActive
                ]}
                onPress={() => setFormData({ ...formData, status })}
              >
                <Text style={[
                  styles.statusButtonText,
                  formData.status === status && styles.statusButtonTextActive
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assign Driver</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.driverList}>
            <TouchableOpacity
              style={[
                styles.driverChip,
                formData.driverId === '' && styles.driverChipActive
              ]}
              onPress={() => setFormData({ ...formData, driverId: '' })}
            >
              <Text style={[
                styles.driverChipText,
                formData.driverId === '' && styles.driverChipTextActive
              ]}>Unassigned</Text>
            </TouchableOpacity>
            
            {drivers.map((driver) => (
              <TouchableOpacity
                key={driver.id}
                style={[
                  styles.driverChip,
                  formData.driverId === driver.id && styles.driverChipActive
                ]}
                onPress={() => setFormData({ ...formData, driverId: driver.id })}
              >
                <UserIcon size={14} color={formData.driverId === driver.id ? '#fff' : '#64748b'} />
                <Text style={[
                  styles.driverChipText,
                  formData.driverId === driver.id && styles.driverChipTextActive
                ]}>
                  {driver.user.fullName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {initialData ? 'Update Vehicle' : 'Create Vehicle'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    marginBottom: 12,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minWidth: 100,
  },
  typeButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  typeButtonText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  statusButtonText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  driverList: {
    flexDirection: 'row',
  },
  driverChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  driverChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  driverChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  driverChipTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
