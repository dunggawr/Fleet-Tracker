import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  StyleSheet
} from 'react-native';
import { 
  Search, 
  Plus, 
  Calendar,
  Package
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrderStore, OrderStatus, Order } from '../../store/useOrderStore';
import { OrderCardItem, STATUS_CONFIG, FILTER_STATUSES } from '../../components/admin/order/OrderCardItem';
import { OrderDateFilter } from '../../components/admin/order/OrderDateFilter';

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { status } = useLocalSearchParams<{ status?: string }>();
  const { orders, loading, fetchOrders } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (status) {
      setSelectedStatus(status as OrderStatus | 'all');
    }
  }, [status]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const id = order?.id || '';
      const pickupAddress = order?.pickupAddress || '';
      const deliveryAddress = order?.deliveryAddress || '';
      const matchesSearch = 
        id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      
      let matchesDate = true;
      if (order.createdAt) {
        const orderTime = new Date(order.createdAt).getTime();
        if (startDate && orderTime < startDate.getTime()) {
          matchesDate = false;
        }
        if (endDate && orderTime > endDate.getTime()) {
          matchesDate = false;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchQuery, selectedStatus, startDate, endDate]);

  const renderOrderCard = useCallback(({ item }: { item: Order }) => (
    <OrderCardItem
      item={item}
      onPress={() => router.push({
        pathname: '/admin/orders/[id]',
        params: { id: item.id }
      })}
    />
  ), [router]);

  return (
    <View className="flex-1 bg-slate-950">
      {/* Decorative premium gradient background */}
      <LinearGradient
        colors={['#e6fcf0', '#f1f5f9', '#ffffff']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.8 }}
      />
      {/* Soft blurred decorative glowing mint/emerald circles */}
      <View 
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: '#34d399',
          opacity: 0.15,
        }}
      />
      <View 
        style={{
          position: 'absolute',
          top: 250,
          left: -120,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: '#10b981',
          opacity: 0.1,
        }}
      />
      <View 
        style={{
          position: 'absolute',
          bottom: 100,
          right: -100,
          width: 320,
          height: 320,
          borderRadius: 160,
          backgroundColor: '#a7f3d0',
          opacity: 0.2,
        }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-row justify-between items-center px-5 pt-[10px] mb-5">
          <View>
            <Text className="text-base text-slate-400 font-medium">Logistics</Text>
            <Text className="text-3xl font-bold text-slate-50">Order Fleet</Text>
          </View>
          <TouchableOpacity 
            className="bg-indigo-500 w-12 h-12 rounded-2xl justify-center items-center shadow-lg shadow-indigo-500/30"
            onPress={() => router.push('/admin/orders/create')}
            activeOpacity={0.7}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="flex-row px-5 mb-4 gap-3">
          <BlurView intensity={40} tint="light" className="flex-1 flex-row items-center rounded-2xl px-4 h-[52px] border border-white/10 overflow-hidden">
            <Search size={20} color="#64748b" className="mr-3" />
            <TextInput
              placeholder="Search orders, addresses..."
              placeholderTextColor="#64748b"
              className="flex-1 text-slate-50 text-base h-full"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </BlurView>
          <TouchableOpacity
            onPress={() => setShowDateFilter(!showDateFilter)}
            className={`w-[52px] h-[52px] rounded-2xl justify-center items-center border border-white/10 bg-slate-800 ${
              (startDate || endDate || showDateFilter) ? 'bg-indigo-500 border-indigo-500' : ''
            }`}
            activeOpacity={0.7}
          >
            <Calendar size={20} color={(startDate || endDate || showDateFilter) ? '#fff' : '#94a3b8'} />
          </TouchableOpacity>
        </View>

        <OrderDateFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
          showDateFilter={showDateFilter}
        />

        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            <TouchableOpacity 
              className={`px-4 py-2 rounded-full bg-slate-800 border border-white/5 ${
                selectedStatus === 'all' ? 'bg-indigo-500 border-indigo-500' : ''
              }`}
              onPress={() => setSelectedStatus('all')}
              activeOpacity={0.7}
            >
              <Text className={`font-semibold text-sm ${
                selectedStatus === 'all' ? 'text-white' : 'text-slate-400'
              }`}>All</Text>
            </TouchableOpacity>
            {FILTER_STATUSES.map((status) => {
              const config = STATUS_CONFIG[status];
              return (
                <TouchableOpacity 
                  key={status}
                  className={`px-4 py-2 rounded-full bg-slate-800 border border-white/5 ${
                    selectedStatus === status ? 'bg-indigo-500 border-indigo-500' : ''
                  }`}
                  onPress={() => setSelectedStatus(status)}
                  activeOpacity={0.7}
                >
                  <Text className={`font-semibold text-sm ${
                    selectedStatus === status ? 'text-white' : 'text-slate-400'
                  }`}>
                    {config?.label || status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl 
              refreshing={loading} 
              onRefresh={fetchOrders} 
              tintColor="#059669"
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View className="items-center justify-center mt-20 gap-4">
                <Package size={64} color="#1e293b" />
                <Text className="text-slate-50 text-xl font-bold">No Orders Found</Text>
                <Text className="text-slate-500 text-base">Try adjusting your search or filters</Text>
              </View>
            ) : (
              <ActivityIndicator size="large" color="#059669" style={{ marginTop: 40 }} />
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}
