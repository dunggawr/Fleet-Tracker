import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Truck, User, Gauge, ChevronRight } from 'lucide-react-native';
import { Vehicle } from '../../store/useFleetStore';

interface VehicleDispatchItemProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onPress: () => void;
}

export const VehicleDispatchItem: React.FC<VehicleDispatchItemProps> = ({ vehicle, isSelected, onPress }) => {
  const driverName = vehicle.driver?.user?.fullName || 'No Driver Assigned';
  const capacityPercent = Math.round((vehicle.currentLoadKg / vehicle.maxCapacityKg) * 100);

  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`p-4 mb-3 rounded-2xl border ${
        isSelected 
          ? 'bg-emerald-500/10 border-emerald-500/50' 
          : 'bg-slate-800/50 border-white/5'
      }`}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <View className={`w-10 h-10 rounded-xl justify-center items-center mr-3 ${
            isSelected ? 'bg-emerald-500' : 'bg-slate-700'
          }`}>
            <Truck size={20} color={isSelected ? '#fff' : '#94a3b8'} />
          </View>
          <View>
            <Text className="text-slate-50 font-bold text-sm">{vehicle.plateNumber}</Text>
            <Text className="text-slate-400 text-[11px] uppercase">{vehicle.type} Truck</Text>
          </View>
        </View>
        <View className="bg-emerald-500/10 px-2 py-1 rounded-md">
          <Text className="text-emerald-500 text-[10px] font-bold uppercase">Available</Text>
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
