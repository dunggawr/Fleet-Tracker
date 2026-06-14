import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Settings2, Scale, Cpu, MapPin } from 'lucide-react-native';

interface Props {
  formData: any;
  setFormData: any;
  isCreate?: boolean;
  onPickLocation?: () => void;
}

export const VehicleBasicInfo = ({ formData, setFormData, isCreate, onPickLocation }: Props) => (
  <View className="mb-6">
    <Text className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Basic Info</Text>
    
    <View className="flex-row items-center bg-slate-800 rounded-2xl border border-white/5 px-4 mb-3 h-14">
      <Settings2 size={20} color="#64748b" style={{ marginRight: 12 }} />
      <TextInput
        className="flex-1 color-slate-50 text-base"
        placeholder="Plate Number"
        placeholderTextColor="#64748b"
        autoCapitalize="characters"
        value={formData.plateNumber}
        onChangeText={(text) => setFormData({ ...formData, plateNumber: text })}
      />
    </View>

    <View className="flex-row items-center bg-slate-800 rounded-2xl border border-white/5 px-4 mb-3 h-14">
      <Scale size={20} color="#64748b" style={{ marginRight: 12 }} />
      <TextInput
        className="flex-1 color-slate-50 text-base"
        placeholder="Max Capacity (kg)"
        placeholderTextColor="#64748b"
        keyboardType="numeric"
        value={formData.maxCapacityKg}
        onChangeText={(text) => setFormData({ ...formData, maxCapacityKg: text })}
      />
    </View>

    <View className="flex-row items-center bg-slate-800 rounded-2xl border border-white/5 px-4 mb-3 h-14">
      <Cpu size={20} color="#64748b" style={{ marginRight: 12 }} />
      <TextInput
        className="flex-1 color-slate-50 text-base"
        placeholder="Device ID (Hardware GPS)"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        value={formData.deviceId}
        onChangeText={(text) => setFormData({ ...formData, deviceId: text })}
      />
    </View>

    {isCreate && (
      <>
        <Text className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mt-4 mb-3">Initial Location</Text>
        
        <View className="flex-row items-center bg-slate-800 rounded-2xl border border-white/5 px-4 mb-3 h-14 justify-between">
          <View className="flex-row items-center flex-1 mr-2">
            <MapPin size={20} color="#64748b" style={{ marginRight: 12 }} />
            <Text className="color-slate-50 text-base truncate">
              {formData.initialLat && formData.initialLng 
                ? `${parseFloat(formData.initialLat).toFixed(6)}, ${parseFloat(formData.initialLng).toFixed(6)}`
                : 'Chưa chọn vị trí'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onPickLocation}
            className="bg-indigo-500/20 border border-indigo-500/30 px-3.5 py-2 rounded-xl"
          >
            <Text className="text-indigo-400 text-xs font-extrabold">Chọn trên bản đồ</Text>
          </TouchableOpacity>
        </View>
      </>
    )}
  </View>
);
