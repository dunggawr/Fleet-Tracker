import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      // Real API call would go here
      // For now, simulating success if email/pass are provided
      // const response = await api.post('/auth/login', { email, password });
      
      // Mocking successful login
      setTimeout(() => {
        setAuth(
          { id: '1', email, fullName: 'Demo Driver', role: 'DRIVER' },
          'mock-token'
        );
        setIsLoading(false);
        router.replace('/(tabs)');
      }, 1500);
      
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials or server error');
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <LogIn size={40} color="#6366f1" />
          </View>
          <Text style={styles.title}>FleetTracker</Text>
          <Text style={styles.subtitle}>Driver Portal</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#6366f1',
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
