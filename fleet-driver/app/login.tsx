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
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import Toast from 'react-native-toast-message';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stage, setStage] = useState<'email' | 'code' | 'password'>('email'); // email -> code -> password
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error?.message || 'Đăng nhập thất bại'
        );
      }

      // Unwrap NestJS ResponseInterceptor format { data, statusCode }
      const payload = data?.data ?? data;
      const accessToken = payload?.accessToken ?? payload?.access_token;
      const { user } = payload;

      if (!accessToken || !user) {
        throw new Error('Phản hồi không hợp lệ từ máy chủ');
      }

      if ((user.role || '').toLowerCase() !== 'driver') {
        throw new Error('Tài khoản này không có quyền truy cập Driver App');
      }

      setAuth(
        {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken
      );

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập email',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      const result = data?.data ?? data;

      if (!response.ok) {
        throw new Error(result?.message || 'Không thể gửi mã reset');
      }

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Mã reset: ${result.resetCode} (Demo - kiểm tra console)`,
      });

      setStage('code');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể gửi mã reset',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập mật khẩu mới',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu không khớp',
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu phải ít nhất 6 ký tự',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          resetCode,
          newPassword,
        }),
      });

      const data = await response.json();
      const result = data?.data ?? data;

      if (!response.ok) {
        throw new Error(result?.message || 'Không thể reset mật khẩu');
      }

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại',
      });

      // Reset form and go back to login
      setIsForgotMode(false);
      setStage('email');
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể reset mật khẩu',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {isForgotMode && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setIsForgotMode(false);
              setStage('email');
              setResetEmail('');
              setResetCode('');
              setNewPassword('');
              setConfirmPassword('');
            }}
          >
            <ArrowLeft size={24} color="#6366f1" />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        )}

        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <LogIn size={40} color="#6366f1" />
          </View>
          <Text style={styles.title}>FleetTracker</Text>
          <Text style={styles.subtitle}>
            {isForgotMode ? 'Reset Password' : 'Driver Portal'}
          </Text>
        </View>

        <View style={styles.form}>
          {!isForgotMode ? (
            <>
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
                  autoCorrect={false}
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
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.forgotButton}
                onPress={() => {
                  setIsForgotMode(true);
                  setStage('email');
                }}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          ) : stage === 'email' ? (
            <>
              <Text style={styles.stageTitle}>Enter Your Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#64748b"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Send Reset Code</Text>
                )}
              </TouchableOpacity>
            </>
          ) : stage === 'code' ? (
            <>
              <Text style={styles.stageTitle}>Enter Reset Code</Text>
              <Text style={styles.stageDesc}>Check your email for the reset code</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Reset code (6 digits)"
                  placeholderTextColor="#64748b"
                  value={resetCode}
                  onChangeText={setResetCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <TouchableOpacity 
                style={[styles.loginButton, (!resetCode || isLoading) && styles.loginButtonDisabled]}
                onPress={() => setStage('password')}
                disabled={!resetCode || isLoading}
              >
                <Text style={styles.loginButtonText}>Next</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.stageTitle}>Enter New Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New password"
                  placeholderTextColor="#64748b"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#64748b"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
  loginButtonDisabled: {
    opacity: 0.7,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  backButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  stageTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stageDesc: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 20,
  },
});
