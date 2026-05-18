import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Truck, User, Gauge, ChevronRight, Sparkles } from 'lucide-react-native';
import { Vehicle } from '../../store/useFleetStore';

interface VehicleDispatchItemProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onPress: () => void;
  distanceKm?: number;
  rank?: number;
}

export const VehicleDispatchItem: React.FC<VehicleDispatchItemProps> = ({ 
  vehicle, 
  isSelected, 
  onPress,
  distanceKm,
  rank
}) => {
  const driverName = vehicle.driver?.user?.fullName || 'No Driver Assigned';
  const capacityPercent = Math.round((vehicle.currentLoadKg / vehicle.maxCapacityKg) * 100);
  const isOptimal = rank === 0;

  // Premium design systems styling tokens
  const containerStyle = isSelected 
    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5' 
    : isOptimal
      ? 'bg-slate-800/80 border-amber-500/30 shadow-lg shadow-amber-500/5'
      : 'bg-slate-800/50 border-white/5';

  const iconBgStyle = isSelected 
    ? 'bg-emerald-500' 
    : isOptimal 
      ? 'bg-amber-500/20 border border-amber-500/30' 
      : 'bg-slate-700';

  const iconColor = isSelected 
    ? '#fff' 
    : isOptimal 
      ? '#f59e0b' 
      : '#94a3b8';

  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`p-4 mb-3 rounded-2xl border ${containerStyle}`}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center flex-1 mr-2">
          <View className={`w-10 h-10 rounded-xl justify-center items-center mr-3 ${iconBgStyle}`}>
            <Truck size={20} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className="text-slate-50 font-bold text-sm" numberOfLines={1}>{vehicle.plateNumber}</Text>
            <Text className="text-slate-400 text-[11px] uppercase" numberOfLines={1}>{vehicle.type} Truck</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5 flex-wrap justify-end max-w-[50%]">
          {isOptimal && (
            <View className="bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 flex-row items-center gap-1">
              <Sparkles size={10} color="#f59e0b" />
              <Text className="text-amber-500 text-[9px] font-bold uppercase tracking-wider">Optimal</Text>
            </View>
          )}
          {distanceKm !== undefined && (
            <View className="bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              <Text className="text-indigo-400 text-[9px] font-bold uppercase">{distanceKm.toFixed(1)} km</Text>
            </View>
          )}
          <View className="bg-emerald-500/10 px-2 py-0.5 rounded-md">
            <Text className="text-emerald-500 text-[9px] font-bold uppercase">Available</Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <User size={14} color="#94a3b8" />
        <Text className="text-slate-300 text-xs ml-2 font-medium">
          {driverName}
        </Text>
      </View>

      <View className="space-y-1.5">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Gauge size={14} color="#94a3b8" />
            <Text className="text-slate-400 text-[11px] ml-1.5">Current Load</Text>
          </View>
          <Text className="text-slate-200 text-[11px] font-bold">{capacityPercent}%</Text>
        </View>
        <View className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <View 
            className={`h-full rounded-full ${capacityPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${capacityPercent}%` }}
          />
        </View>
      </View>

      {isSelected && (
        <View className="mt-3 pt-3 border-t border-emerald-500/20 flex-row justify-end items-center">
          <Text className="text-emerald-400 text-[11px] font-bold mr-1">Ready to Assign</Text>
          <ChevronRight size={14} color="#10b981" />
        </View>
      )}
    </TouchableOpacity>
  );
};
