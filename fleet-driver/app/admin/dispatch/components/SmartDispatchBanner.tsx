import React from 'react';
import { View, Text } from 'react-native';
import { Zap } from 'lucide-react-native';

interface SmartDispatchBannerProps {
  selectedOrderId: string | null;
  isSuggestLoading: boolean;
  suggestedCount: number;
}

const SmartDispatchBanner: React.FC<SmartDispatchBannerProps> = ({
  selectedOrderId,
  isSuggestLoading,
  suggestedCount,
}) => {
  if (!selectedOrderId) return null;

  return (
    <View className="mb-4 p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex-row items-center">
      <Zap size={18} color="#6366f1" className="mr-2" />
      <View className="flex-1 ml-2">
        <Text className="text-indigo-400 font-bold text-xs uppercase tracking-wider">Smart Dispatch Active</Text>
        <Text className="text-slate-300 text-xs mt-0.5">
          {isSuggestLoading 
            ? "Calculating optimal vehicles based on proximity and remaining load capacity..." 
            : suggestedCount > 0 
              ? `Discovered ${suggestedCount} highly optimal vehicles matching this order.` 
              : "No perfect recommendation scores calculated. Displaying all available resources."}
        </Text>
      </View>
    </View>
  );
};

export default SmartDispatchBanner;
