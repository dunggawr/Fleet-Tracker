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
  ActivityIndicator,
  Modal
} from 'react-native';
import { User, Mail, Phone, ShieldCheck, Calendar, Lock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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

  const [showDatePicker, setShowDatePicker] = useState(false);

  const getExpiryDate = () => {
    if (formData.licenseExpiry) {
      const d = new Date(formData.licenseExpiry);
      if (!isNaN(d.getTime())) {
        return d;
      }
    }
    return new Date();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;
      setFormData({ ...formData, licenseExpiry: formattedDate });
    }
  };

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

          <TouchableOpacity 
            style={styles.inputGroup} 
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Calendar size={20} color="#64748b" style={styles.inputIcon} />
            <Text style={[
              styles.inputText, 
              !formData.licenseExpiry && styles.inputPlaceholder
            ]}>
              {formData.licenseExpiry 
                ? formData.licenseExpiry 
                : 'Expiry Date (YYYY-MM-DD)'}
            </Text>
          </TouchableOpacity>
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

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={getExpiryDate()}
          mode="date"
          display="calendar"
          onChange={handleDateChange}
        />
      )}

      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainerIOS}>
              <View style={styles.pickerHeaderIOS}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerCancelTextIOS}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitleIOS}>Select Expiry Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerConfirmTextIOS}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={getExpiryDate()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                textColor="#f8fafc"
                themeVariant="dark"
              />
            </View>
          </View>
        </Modal>
      )}
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
  inputText: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
  },
  inputPlaceholder: {
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  pickerContainerIOS: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pickerHeaderIOS: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pickerTitleIOS: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  pickerCancelTextIOS: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  pickerConfirmTextIOS: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: 'bold',
  },
});
