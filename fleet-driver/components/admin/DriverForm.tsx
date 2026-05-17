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
import { User, Mail, Phone, ShieldCheck, Calendar, Lock } from 'lucide-react-native';
import { Driver, DriverStatus } from '../../store/useFleetStore';

interface DriverFormProps {
  initialData?: Driver;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

export const DriverForm: React.FC<DriverFormProps> = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.user.fullName || '',
    email: initialData?.user.email || '',
    password: '',
    phone: initialData?.user.phone || '',
    licenseClass: initialData?.licenseClass || '',
    licenseExpiry: initialData?.licenseExpiry || '',
    status: initialData?.status || DriverStatus.OFF_DUTY,
  });

  const handleSubmit = () => {
    if (initialData) {
      const { password, ...updateData } = formData;
      onSubmit(updateData);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <User size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#64748b"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Mail size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
          </View>

          {!initialData && (
            <View style={styles.inputGroup}>
              <Lock size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#64748b"
                secureTextEntry={true}
                autoCapitalize="none"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Phone size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver License</Text>
          
          <View style={styles.inputGroup}>
            <ShieldCheck size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="License Class (e.g. C, FC)"
              placeholderTextColor="#64748b"
              value={formData.licenseClass}
              onChangeText={(text) => setFormData({ ...formData, licenseClass: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Calendar size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Expiry Date (YYYY-MM-DD)"
              placeholderTextColor="#64748b"
              value={formData.licenseExpiry}
              onChangeText={(text) => setFormData({ ...formData, licenseExpiry: text })}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>
            {Object.values(DriverStatus).map((status) => (
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
                  {status.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
              {initialData ? 'Update Driver' : 'Create Driver'}
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
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
