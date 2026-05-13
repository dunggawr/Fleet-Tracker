import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Mail, Lock, ShieldCheck, ChevronRight, ArrowLeft } from "lucide-react-native";
import { useAuthStore } from "../store/useAuthStore";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState<"email" | "code" | "password">("email");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || data?.error?.message || "Login failed");
      }

      const payload = data?.data ?? data;
      const accessToken = payload?.accessToken ?? payload?.access_token;
      const refreshToken = payload?.refreshToken ?? payload?.refresh_token;
      const { user } = payload;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Invalid server response");
      }

      if ((user.role || "").toLowerCase() !== "driver") {
        throw new Error("Access denied: Drivers only");
      }

      setAuth(
        {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      );

      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Server connection error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Toast.show({ type: "error", text1: "Error", text2: "Please enter your email" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      const result = data?.data ?? data;

      if (!response.ok) throw new Error(result?.message || "Could not send reset code");

      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: `Reset code: ${result.resetCode} (Demo)`,
      });

      setStage("code");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to send reset code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill all fields" });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "Error", text2: "Passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({ type: "error", text1: "Error", text2: "Password must be at least 6 characters" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, resetCode, newPassword }),
      });

      const data = await response.json();
      const result = data?.data ?? data;

      if (!response.ok) throw new Error(result?.message || "Could not reset password");

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Password changed successfully",
      });

      setIsForgotMode(false);
      setStage("email");
      setResetEmail("");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={["#020617", "#0f172a", "#020617"]}
        className="flex-1"
      >
        {/* Animated Background Elements */}
        <View 
          className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/10"
          style={{ top: -100, right: -150 }}
        />
        <View 
          className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/5"
          style={{ bottom: -50, left: -100 }}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 px-8 justify-center"
        >
          {isForgotMode && (
            <TouchableOpacity
              className="flex-row items-center mb-8 gap-2"
              onPress={() => {
                setIsForgotMode(false);
                setStage("email");
              }}
            >
              <BlurView intensity={20} className="w-10 h-10 rounded-full items-center justify-center border border-white/10 overflow-hidden">
                <ArrowLeft size={20} color="#94a3b8" />
              </BlurView>
              <Text className="text-slate-400 text-base font-black uppercase tracking-widest">Login Portal</Text>
            </TouchableOpacity>
          )}

          <View className="items-center mb-16">
            <View className="w-24 h-24 rounded-[32px] bg-indigo-500/20 justify-center items-center mb-6 border border-indigo-500/30 rotate-12 shadow-2xl shadow-indigo-500/20">
              <View className="-rotate-12">
                <ShieldCheck size={48} color="#818cf8" strokeWidth={1.5} />
              </View>
            </View>
            <Text className="text-5xl font-black text-white tracking-tighter italic">
              FLEET<Text className="text-indigo-400">TRACKER</Text>
            </Text>
            <Text className="text-indigo-500/60 text-xs font-black uppercase tracking-[4px] mt-2">
              {isForgotMode ? "Security Verification" : "Secure Driver Network"}
            </Text>
          </View>

          <BlurView 
            intensity={Platform.OS === 'ios' ? 20 : 40}
            tint="dark"
            className="w-full rounded-[48px] overflow-hidden border border-white/10 shadow-2xl"
          >
            <View className="p-10 bg-slate-900/40">
              {!isForgotMode ? (
                <View className="gap-6">
                  <View className="gap-5">
                    <View className="flex-row items-center bg-black/40 rounded-3xl px-6 h-18 border border-white/5 shadow-inner">
                      <Mail size={20} color="#6366f1" />
                      <TextInput
                        className="flex-1 text-white text-lg ml-4 font-medium"
                        placeholder="Driver ID / Email"
                        placeholderTextColor="#475569"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>

                    <View className="flex-row items-center bg-black/40 rounded-3xl px-6 h-18 border border-white/5 shadow-inner">
                      <Lock size={20} color="#6366f1" />
                      <TextInput
                        className="flex-1 text-white text-lg ml-4 font-medium"
                        placeholder="Access Key"
                        placeholderTextColor="#475569"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleLogin}
                    disabled={isLoading}
                    className="mt-2"
                  >
                    <LinearGradient
                      colors={["#6366f1", "#4f46e5"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="h-18 rounded-3xl justify-center items-center shadow-2xl shadow-indigo-500/40"
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <View className="flex-row items-center gap-3">
                          <Text className="text-white text-xl font-black uppercase tracking-widest">Authorize</Text>
                          <ChevronRight size={22} color="#fff" strokeWidth={3} />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="items-center mt-4"
                    onPress={() => {
                      setIsForgotMode(true);
                      setStage("email");
                    }}
                  >
                    <Text className="text-slate-500 text-xs font-black uppercase tracking-widest">Lost Access Key?</Text>
                  </TouchableOpacity>
                </View>
              ) : stage === "email" ? (
                <View className="gap-6">
                  <View>
                    <Text className="text-white text-2xl font-black tracking-tight mb-1">Reset Key</Text>
                    <Text className="text-slate-500 text-sm font-medium mb-6">Enter your registered email below</Text>
                  </View>
                  
                  <View className="flex-row items-center bg-black/40 rounded-3xl px-6 h-18 border border-white/5 shadow-inner">
                    <Mail size={20} color="#6366f1" />
                    <TextInput
                      className="flex-1 text-white text-lg ml-4 font-medium"
                      placeholder="Email address"
                      placeholderTextColor="#475569"
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleForgotPassword}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={["#6366f1", "#4f46e5"]}
                      className="h-18 rounded-3xl justify-center items-center shadow-2xl shadow-indigo-500/40"
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white text-lg font-black uppercase tracking-widest">Send Recovery Code</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : stage === "code" ? (
                <View className="gap-6">
                  <View>
                    <Text className="text-white text-2xl font-black tracking-tight mb-1">Verification</Text>
                    <Text className="text-slate-500 text-sm font-medium mb-6">Enter the 6-digit code sent to you</Text>
                  </View>

                  <View className="flex-row items-center bg-black/40 rounded-3xl px-6 h-18 border border-white/5 shadow-inner">
                    <Lock size={20} color="#6366f1" />
                    <TextInput
                      className="flex-1 text-white text-2xl font-black tracking-[12px] ml-4"
                      placeholder="000000"
                      placeholderTextColor="#334155"
                      value={resetCode}
                      onChangeText={setResetCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setStage("password")}
                    disabled={!resetCode || isLoading}
                  >
                    <LinearGradient
                      colors={["#6366f1", "#4f46e5"]}
                      className="h-18 rounded-3xl justify-center items-center shadow-2xl shadow-indigo-500/40"
                    >
                      <Text className="text-white text-lg font-black uppercase tracking-widest">Verify Identity</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="gap-6">
                  <View>
                    <Text className="text-white text-2xl font-black tracking-tight mb-1">New Key</Text>
                    <Text className="text-slate-500 text-sm font-medium mb-6">Create a secure new access key</Text>
                  </View>

                  <View className="gap-4">
                    <View className="flex-row items-center bg-black/40 rounded-3xl px-6 h-18 border border-white/5 shadow-inner">
                      <Lock size={20} color="#6366f1" />
                      <TextInput
                        className="flex-1 text-white text-lg ml-4 font-medium"
                        placeholder="New access key"
                        placeholderTextColor="#475569"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                      />
                    </View>
                    <View className="flex-row items-center bg-black/40 rounded-3xl px-6 h-18 border border-white/5 shadow-inner">
                      <Lock size={20} color="#6366f1" />
                      <TextInput
                        className="flex-1 text-white text-lg ml-4 font-medium"
                        placeholder="Confirm key"
                        placeholderTextColor="#475569"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={["#6366f1", "#4f46e5"]}
                      className="h-18 rounded-3xl justify-center items-center shadow-2xl shadow-indigo-500/40"
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white text-lg font-black uppercase tracking-widest">Update Portal Key</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </BlurView>
          
          <View className="mt-16 items-center">
            <Text className="text-slate-700 text-[10px] font-black tracking-[3px] uppercase">
              Operational Intelligence System
            </Text>
            <Text className="text-slate-800 text-[8px] font-bold uppercase mt-2 tracking-widest">
              v2.4.0 • Encrypted Connection
            </Text>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
