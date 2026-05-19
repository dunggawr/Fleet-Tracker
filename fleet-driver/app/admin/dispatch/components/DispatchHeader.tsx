import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';

interface DispatchHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const DispatchHeader: React.FC<DispatchHeaderProps> = ({
  onBack,
  onRefresh,
  isLoading,
}) => {
  return (
    <View className="px-6 py-4 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <TouchableOpacity 
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-slate-900 justify-center items-center mr-4"
        >
          <ArrowLeft size={20} color="#f8fafc" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-slate-50">Dispatch Center</Text>
          <Text className="text-slate-400 text-xs">Assign pending orders</Text>
        </View>
      </View>
      <TouchableOpacity 
        onPress={onRefresh}
        disabled={isLoading}
        className="w-10 h-10 rounded-full bg-slate-900 justify-center items-center"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#6366f1" />
        ) : (
          <RefreshCw size={18} color="#94a3b8" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default DispatchHeader;
