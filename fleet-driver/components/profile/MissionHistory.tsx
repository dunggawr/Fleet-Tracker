import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import { Navigation, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface MissionHistoryProps {
  tripHistory: any[];
}

export const MissionHistory: React.FC<MissionHistoryProps> = ({ tripHistory }) => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const renderTripItem = (trip: any, idx: number, showDivider: boolean) => (
    <TouchableOpacity 
      key={trip.id} 
      className={`flex-row items-center justify-between p-5 ${showDivider ? 'border-t border-white/5' : ''}`}
      onPress={() => {
        setModalVisible(false);
        router.push(`/trip/${trip.id}`);
      }}
    >
      <View className="flex-row items-center gap-4">
        <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center">
          <Navigation size={18} color={trip.status === 'completed' ? '#10b981' : '#6366f1'} />
        </View>
        <View>
          <Text className="text-white text-sm font-bold mb-0.5 tracking-tight">
            TRIP #{trip.id.substring(0, 8).toUpperCase()}
          </Text>
          <Text className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
            {new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      </View>
      <View 
        className={`px-3 py-1 rounded-full border ${trip.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-500/10 border-slate-500/20'}`}
      >
        <Text className={`text-[8px] font-black uppercase tracking-widest ${trip.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'}`}>
          {trip.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="px-5 mt-10">
      <View className="flex-row items-center justify-between mb-4 ml-1">
        <View className="flex-row items-center">
          <View className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-2" />
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[2px]">Mission History</Text>
        </View>
        {tripHistory.length > 3 && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text className="text-indigo-400 text-[10px] font-black uppercase">View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View className="bg-slate-900/40 rounded-[32px] overflow-hidden border border-white/5">
        {tripHistory.length > 0 ? (
          tripHistory.slice(0, 3).map((trip, idx) => renderTripItem(trip, idx, idx !== 0))
        ) : (
          <View className="p-10 items-center">
            <Text className="text-slate-600 font-bold text-sm">No activity recorded yet</Text>
          </View>
        )}
      </View>

      {/* View All Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-slate-950">
          {/* Modal Header */}
          <View className="px-6 py-5 flex-row items-center justify-between border-b border-white/5">
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />
              <Text className="text-slate-200 text-lg font-bold">Lịch sử chuyến đi</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              className="w-8 h-8 rounded-full bg-white/5 justify-center items-center"
            >
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Full List of Trips */}
          <ScrollView 
            className="flex-1 px-5 mt-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="bg-slate-900/40 rounded-[32px] overflow-hidden border border-white/5">
              {tripHistory.map((trip, idx) => renderTripItem(trip, idx, idx !== 0))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};
