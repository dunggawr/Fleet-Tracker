import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { User as UserIcon, ChevronDown, Check, UserX } from 'lucide-react-native';

interface Props {
  drivers: any[];
  selectedDriverId: string;
  setDriverId: (id: string) => void;
}

export const DriverAssigner = ({ drivers, selectedDriverId, setDriverId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);

  return (
    <View className="mb-6">
      <Text className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Assign Driver</Text>
      
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center bg-slate-800 rounded-2xl h-[52px] px-4 gap-3 border border-white/5"
        activeOpacity={0.7}
      >
        <UserIcon size={18} color={selectedDriverId ? '#6366f1' : '#64748b'} />
        <Text className="flex-1 text-slate-50 text-[15px] font-semibold">
          {selectedDriver ? selectedDriver.user.fullName : 'Unassigned'}
        </Text>
        <ChevronDown size={18} color="#64748b" />
      </TouchableOpacity>

      {isOpen && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isOpen}
          onRequestClose={() => setIsOpen(false)}
        >
          <TouchableOpacity 
            className="flex-1 justify-end bg-black/60"
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          >
            <View className="bg-slate-900 rounded-t-3xl border border-slate-700 pb-8 pt-4 px-5 max-h-[85%]">
              <View className="w-12 h-1.5 bg-slate-700 rounded-full self-center mb-5" />
              
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-slate-50">Assign Driver</Text>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Text className="text-base text-indigo-500 font-bold">Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ gap: 12 }}>
                {/* Option: Unassigned */}
                <TouchableOpacity
                  onPress={() => {
                    setDriverId('');
                    setIsOpen(false);
                  }}
                  className={`p-4 rounded-2xl border flex-row items-center justify-between ${
                    selectedDriverId === '' ? 'bg-indigo-500/10 border-indigo-500' : 'bg-slate-800 border-slate-700/50'
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <UserX size={18} color="#ef4444" />
                    <View className="flex-1">
                      <Text className={`font-bold text-base ${selectedDriverId === '' ? 'text-indigo-400' : 'text-slate-50'}`}>
                        Unassigned
                      </Text>
                      <Text className="text-xs text-slate-400 mt-1">No driver assigned to this vehicle</Text>
                    </View>
                  </View>
                  {selectedDriverId === '' && (
                    <Check size={18} color="#6366f1" />
                  )}
                </TouchableOpacity>

                {/* List of available/eligible drivers */}
                {drivers.map((driver) => {
                  const isSelected = selectedDriverId === driver.id;
                  return (
                    <TouchableOpacity
                      key={driver.id}
                      onPress={() => {
                        setDriverId(driver.id);
                        setIsOpen(false);
                      }}
                      className={`p-4 rounded-2xl border flex-row items-center justify-between ${
                        isSelected ? 'bg-indigo-500/10 border-indigo-500' : 'bg-slate-800 border-slate-700/50'
                      }`}
                    >
                      <View className="flex-row items-center gap-3 flex-1 pr-4">
                        <UserIcon size={18} color={isSelected ? '#6366f1' : '#94a3b8'} />
                        <View className="flex-1">
                          <Text className={`font-bold text-base ${isSelected ? 'text-indigo-400' : 'text-slate-50'}`}>
                            {driver.user.fullName}
                          </Text>
                          <Text className="text-xs text-slate-400 mt-1">
                            Phone: {driver.user.phone || 'N/A'} • License: {driver.licenseClass || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Check size={18} color="#6366f1" />
                      )}
                    </TouchableOpacity>
                  );
                })}

                {drivers.length === 0 && selectedDriverId !== '' && (
                  <View className="py-8 items-center">
                    <Text className="text-slate-500 text-sm">No other available drivers</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

