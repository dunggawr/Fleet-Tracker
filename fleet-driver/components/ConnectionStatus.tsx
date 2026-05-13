import React from 'react';
import { View, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useTripStore } from '../store/useTripStore';

export const ConnectionStatus = () => {
  const isSocketConnected = useTripStore((state) => state.isSocketConnected);

  if (isSocketConnected) return null;

  return (
    <View className="flex-row items-center bg-red-500/15 px-3 py-1.5 rounded-full gap-2 border border-red-500/30">
      <View className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      <WifiOff size={12} color="#ef4444" strokeWidth={2.5} />
      <Text className="text-red-500 text-[10px] font-black tracking-[1px] uppercase">Offline Sync</Text>
    </View>
  );
};

