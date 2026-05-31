import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User, Check, Award, Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface ProfileHeaderProps {
  user: any;
  onUpdateAvatar?: () => Promise<void>;
  isUploading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  onUpdateAvatar, 
  isUploading = false 
}) => {
  return (
    <View className="pt-16 pb-12 overflow-hidden">
      <View className="items-center px-6">
        <View className="w-28 h-28 relative mb-6">
          <LinearGradient
            colors={['#6366f1', '#a855f7']}
            className="absolute inset-0 rounded-full opacity-20"
            style={{ transform: [{ scale: 1.2 }] }}
          />
          
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onUpdateAvatar}
            disabled={isUploading || !onUpdateAvatar}
            className="w-full h-full rounded-full p-1 bg-slate-900 border border-white/10 overflow-hidden shadow-2xl relative"
          >
            {user?.avatarUrl ? (
              <Image 
                source={{ uri: user.avatarUrl }} 
                className="w-full h-full rounded-full" 
              />
            ) : (
              <View className="flex-1 rounded-full bg-slate-800 justify-center items-center">
                <User size={56} color="#6366f1" />
              </View>
            )}

            {/* Camera Glassmorphic Semi-transparent Overlay at the bottom */}
            {onUpdateAvatar && (
              <View className="absolute bottom-0 left-0 right-0 h-8 bg-slate-950/60 justify-center items-center border-t border-white/5">
                <Camera size={14} color="#a855f7" />
              </View>
            )}

            {/* Uploading loading overlay */}
            {isUploading && (
              <View className="absolute inset-0 bg-slate-950/70 justify-center items-center rounded-full">
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            )}
          </TouchableOpacity>

          <View className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-slate-950 items-center justify-center">
            <Check size={14} color="white" strokeWidth={3} />
          </View>
        </View>

        <Text className="text-3xl font-black text-white text-center tracking-tight mb-2">
          {user?.fullName || user?.email || 'Driver Name'}
        </Text>
        
        <BlurView intensity={20} className="rounded-full overflow-hidden border border-white/10">
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.1)', 'rgba(168, 85, 247, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center px-4 py-1.5 gap-2"
          >
            <Award size={14} color="#6366f1" />
            <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-[2px]">
              {user?.role?.toUpperCase() || 'PREMIUM DRIVER'}
            </Text>
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );
};
