import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useOrderStore, OrderStatus } from '../../../store/useOrderStore';
import { useFleetStore, VehicleStatus } from '../../../store/useFleetStore';
import { OrderDispatchItem } from '../../../components/admin/OrderDispatchItem';
import { VehicleDispatchItem } from '../../../components/admin/VehicleDispatchItem';

export default function DispatchCenterScreen() {
  const router = useRouter();
  const { orders, fetchOrders, assignOrder, loading: ordersLoading } = useOrderStore();
  const { vehicles, fetchVehicles, loading: fleetLoading } = useFleetStore();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchOrders({ status: OrderStatus.PENDING }),
      fetchVehicles(),
    ]);
  };

  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
  const availableVehicles = vehicles.filter(v => 
    v.status === VehicleStatus.AVAILABLE && v.driverId !== null
  );

  const handleAssign = async () => {
    if (!selectedOrderId || !selectedVehicleId) return;

    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (!vehicle || !vehicle.driverId) {
      Alert.alert('Error', 'Selected vehicle must have a driver assigned.');
      return;
    }

    Alert.alert(
      'Confirm Dispatch',
      `Assign Order #${selectedOrderId.slice(-6).toUpperCase()} to Vehicle ${vehicle.plateNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await assignOrder(selectedOrderId, selectedVehicleId, vehicle.driverId!);
              Alert.alert('Success', 'Order has been dispatched successfully!');
              setSelectedOrderId(null);
              setSelectedVehicleId(null);
              loadData();
            } catch (error: any) {
              Alert.alert('Dispatch Failed', error.message);
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const isLoading = ordersLoading || fleetLoading;

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
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
          onPress={loadData}
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

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Section 1: Pending Orders */}
        <View className="mt-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-50 font-bold text-lg">Pending Orders</Text>
            <View className="bg-amber-500/20 px-2 py-0.5 rounded-full">
              <Text className="text-amber-500 text-[10px] font-bold">{pendingOrders.length}</Text>
            </View>
          </View>
          
          {pendingOrders.length === 0 ? (
            <View className="bg-slate-900/50 rounded-3xl p-8 items-center border border-dashed border-slate-800">
              <AlertCircle size={32} color="#475569" />
              <Text className="text-slate-400 mt-2 text-center text-sm">No pending orders available</Text>
            </View>
          ) : (
            pendingOrders.map(order => (
              <OrderDispatchItem
                key={order.id}
                order={order}
                isSelected={selectedOrderId === order.id}
                onPress={() => setSelectedOrderId(order.id === selectedOrderId ? null : order.id)}
              />
            ))
          )}
        </View>

        {/* Section 2: Available Vehicles */}
        <View className="mb-24">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-50 font-bold text-lg">Available Resources</Text>
            <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full">
              <Text className="text-emerald-500 text-[10px] font-bold">{availableVehicles.length}</Text>
            </View>
          </View>

          {availableVehicles.length === 0 ? (
            <View className="bg-slate-900/50 rounded-3xl p-8 items-center border border-dashed border-slate-800">
              <AlertCircle size={32} color="#475569" />
              <Text className="text-slate-400 mt-2 text-center text-sm">No available vehicles with drivers</Text>
            </View>
          ) : (
            availableVehicles.map(vehicle => (
              <VehicleDispatchItem
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedVehicleId === vehicle.id}
                onPress={() => setSelectedVehicleId(vehicle.id === selectedVehicleId ? null : vehicle.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {selectedOrderId && selectedVehicleId && (
        <View className="absolute bottom-10 left-6 right-6">
          <TouchableOpacity 
            onPress={handleAssign}
            disabled={isSubmitting}
            className="bg-indigo-600 h-16 rounded-2xl flex-row justify-center items-center shadow-xl shadow-indigo-500/20"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Send size={20} color="#fff" />
                <Text className="text-white font-bold ml-3 text-lg">Confirm Assignment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
