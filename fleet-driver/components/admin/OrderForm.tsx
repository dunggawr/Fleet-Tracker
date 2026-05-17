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
import { 
  MapPin, 
  Scale, 
  FileText, 
  ChevronRight, 
  AlertCircle,
  Map as MapIcon
} from 'lucide-react-native';
import { Order, OrderStatus } from '../../store/useOrderStore';
import { MapPicker } from './MapPicker';
import { AddressAutocomplete } from './AddressAutocomplete';

interface OrderFormProps {
  initialData?: Partial<Order>;
  onSubmit: (data: Partial<Order>) => Promise<void>;
  loading?: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    pickupAddress: initialData?.pickupAddress || '',
    deliveryAddress: initialData?.deliveryAddress || '',
    weightKg: initialData?.weightKg?.toString() || '',
    description: initialData?.description || '',
    pickupLocation: initialData?.pickupLocation?.coordinates || null,
    deliveryLocation: initialData?.deliveryLocation?.coordinates || null,
  });

  const [pickingLocation, setPickingLocation] = useState<'pickup' | 'delivery' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.pickupAddress) newErrors.pickupAddress = 'Required';
    if (!formData.deliveryAddress) newErrors.deliveryAddress = 'Required';
    if (!formData.weightKg || isNaN(Number(formData.weightKg))) newErrors.weightKg = 'Invalid weight';
    if (!formData.pickupLocation) newErrors.pickupLocation = 'Pick location on map';
    if (!formData.deliveryLocation) newErrors.deliveryLocation = 'Pick location on map';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      ...formData,
      weightKg: Number(formData.weightKg),
      pickupLocation: {
        type: 'Point',
        coordinates: formData.pickupLocation,
      },
      deliveryLocation: {
        type: 'Point',
        coordinates: formData.deliveryLocation,
      },
      status: initialData?.status || OrderStatus.PENDING,
    } as any);
  };

  const handleLocationSelect = (coords: { latitude: number; longitude: number }) => {
    if (pickingLocation === 'pickup') {
      setFormData({ ...formData, pickupLocation: [coords.longitude, coords.latitude] });
    } else if (pickingLocation === 'delivery') {
      setFormData({ ...formData, deliveryLocation: [coords.longitude, coords.latitude] });
    }
    setPickingLocation(null);
  };

  if (pickingLocation) {
    return (
      <MapPicker
        title={`Set ${pickingLocation === 'pickup' ? 'Pickup' : 'Delivery'} Point`}
        initialLocation={
          pickingLocation === 'pickup' && formData.pickupLocation 
            ? { latitude: formData.pickupLocation[1], longitude: formData.pickupLocation[0] }
            : pickingLocation === 'delivery' && formData.deliveryLocation
            ? { latitude: formData.deliveryLocation[1], longitude: formData.deliveryLocation[0] }
            : undefined
        }
        onSelect={handleLocationSelect}
        onCancel={() => setPickingLocation(null)}
      />
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Pickup Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Pickup Details</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <AddressAutocomplete
              value={formData.pickupAddress}
              placeholder="Search pickup address"
              onSelect={(address, coords) => setFormData({ 
                ...formData, 
                pickupAddress: address, 
                pickupLocation: coords 
              })}
              error={errors.pickupAddress}
            />
          </View>

          <TouchableOpacity 
            style={[styles.mapButton, errors.pickupLocation && styles.mapButtonError]}
            onPress={() => setPickingLocation('pickup')}
          >
            <MapIcon size={20} color={formData.pickupLocation ? '#10b981' : '#64748b'} />
            <Text style={[styles.mapButtonText, formData.pickupLocation && styles.mapButtonTextSuccess]}>
              {formData.pickupLocation ? 'Pickup Location Set' : 'Set Pickup on Map'}
            </Text>
            <ChevronRight size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Delivery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#10b981" />
            <Text style={styles.sectionTitle}>Delivery Details</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <AddressAutocomplete
              value={formData.deliveryAddress}
              placeholder="Search delivery address"
              onSelect={(address, coords) => setFormData({ 
                ...formData, 
                deliveryAddress: address, 
                deliveryLocation: coords 
              })}
              error={errors.deliveryAddress}
            />
          </View>

          <TouchableOpacity 
            style={[styles.mapButton, errors.deliveryLocation && styles.mapButtonError]}
            onPress={() => setPickingLocation('delivery')}
          >
            <MapIcon size={20} color={formData.deliveryLocation ? '#10b981' : '#64748b'} />
            <Text style={[styles.mapButtonText, formData.deliveryLocation && styles.mapButtonTextSuccess]}>
              {formData.deliveryLocation ? 'Delivery Location Set' : 'Set Delivery on Map'}
            </Text>
            <ChevronRight size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Cargo Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Scale size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Cargo Info</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={[styles.input, errors.weightKg && styles.inputError]}
              placeholder="e.g. 150.5"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={formData.weightKg}
              onChangeText={(text) => setFormData({ ...formData, weightKg: text })}
            />
            {!!errors.weightKg && <Text style={styles.errorText}>{errors.weightKg}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <FileText size={16} color="#64748b" />
              <Text style={styles.label}>Description (Optional)</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Cargo type, handling instructions..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
          </View>
        </View>

        {errors.pickupLocation || errors.deliveryLocation ? (
          <View style={styles.globalError}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={styles.globalErrorText}>Please select locations on the map</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {initialData?.id ? 'Update Order' : 'Create New Order'}
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
    gap: 20,
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginLeft: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    color: '#f8fafc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  mapButtonError: {
    borderColor: '#ef4444',
  },
  mapButtonText: {
    flex: 1,
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
  mapButtonTextSuccess: {
    color: '#10b981',
  },
  globalError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  globalErrorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
