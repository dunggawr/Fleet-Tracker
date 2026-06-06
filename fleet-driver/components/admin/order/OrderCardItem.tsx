import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Scale,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock3,
  Timer,
  User 
} from 'lucide-react-native';
import { Order, OrderStatus } from '../../../store/useOrderStore';

export const STATUS_CONFIG = {
  [OrderStatus.PENDING]: { label: 'Pending', color: '#f59e0b', icon: Clock3 },
  [OrderStatus.ASSIGNED]: { label: 'Assigned', color: '#6366f1', icon: Package },
  [OrderStatus.PICKED_UP]: { label: 'Picked Up', color: '#8b5cf6', icon: MapPin },
  [OrderStatus.DELIVERING]: { label: 'Delivering', color: '#0ea5e9', icon: MapPin },
  [OrderStatus.DELIVERED]: { label: 'Delivered', color: '#10b981', icon: CheckCircle2 },
  [OrderStatus.FAILED]: { label: 'Failed', color: '#ef4444', icon: AlertCircle },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', color: '#94a3b8', icon: XCircle },
};

export const FILTER_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.ASSIGNED,
  OrderStatus.DELIVERING,
  OrderStatus.DELIVERED,
  OrderStatus.FAILED,
];

// ─── Countdown helper ───────────────────────────────────────────────
function useCountdown(deadline?: string) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!deadline) { setRemaining(null); return; }
    const calc = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      setRemaining(diff);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return remaining;
}

function formatCountdown(ms: number | null): { text: string; color: string } {
  if (ms === null) return { text: '', color: '#64748b' };
  if (ms <= 0) return { text: 'Overdue', color: '#ef4444' };
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const color = ms < 3600_000 ? '#ef4444' : ms < 7_200_000 ? '#f59e0b' : '#10b981';
  if (d > 0) return { text: `${d}d ${h}h ${m}m`, color };
  if (h > 0) return { text: `${h}h ${m}m ${s}s`, color };
  return { text: `${m}m ${s}s`, color };
}

interface OrderCardItemProps {
  item: Order;
  onPress: () => void;
}

export const OrderCardItem: React.FC<OrderCardItemProps> = ({ item, onPress }) => {
  const config = STATUS_CONFIG[item.status] || STATUS_CONFIG[OrderStatus.PENDING];
  const StatusIcon = config.icon;
  const remaining = useCountdown(item.deliveryDeadline);
  const countdown = formatCountdown(remaining);
  const isActive = ![OrderStatus.DELIVERED, OrderStatus.FAILED, OrderStatus.CANCELLED].includes(item.status);

  return (
    <TouchableOpacity
      className="bg-slate-800 rounded-3xl p-5 mb-4 border border-white/10"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header row: ORDER ID + recipient + status */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="gap-[2px] flex-1 mr-4">
          <Text className="text-[10px] text-slate-500 font-bold tracking-wider">ORDER ID</Text>
          <Text className="text-sm text-slate-50 font-bold">#{item.id.slice(0, 8).toUpperCase()}</Text>
          {item.recipientName ? (
            <View className="flex-row items-center gap-1 mt-1">
              <User size={11} color="#6366f1" />
              <Text className="text-indigo-300 text-[11px] font-semibold" numberOfLines={1}>
                {item.recipientName}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="flex-row items-center px-[10px] py-1 rounded-xl gap-1.5" style={{ backgroundColor: `${config.color}20` }}>
          <StatusIcon size={14} color={config.color} />
          <Text className="text-xs font-bold" style={{ color: config.color }}>{config.label}</Text>
        </View>
      </View>

      {/* Route */}
      <View className="mb-5">
        <View className="flex-row items-center gap-3">
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
          <Text className="text-slate-300 text-sm flex-1" numberOfLines={1}>{item.pickupAddress}</Text>
        </View>
        <View className="w-[2px] h-3 bg-white/10 ml-[3px] my-1" />
        <View className="flex-row items-center gap-3">
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
          <Text className="text-slate-300 text-sm flex-1" numberOfLines={1}>{item.deliveryAddress}</Text>
        </View>
      </View>

      {/* Footer: weight + countdown/date + chevron */}
      <View className="flex-row items-center pt-4 border-t border-white/5 gap-3">
        <View className="flex-row items-center gap-1.5">
          <Scale size={16} color="#94a3b8" />
          <Text className="text-slate-400 text-[13px] font-semibold">{item.weightKg} kg</Text>
        </View>
        {item.deliveryDeadline && isActive ? (
          <View className="flex-row items-center gap-1.5 flex-1">
            <Timer size={14} color={countdown.color} />
            <Text className="text-[12px] font-bold" style={{ color: countdown.color }} numberOfLines={1}>
              {countdown.text}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1.5 flex-1">
            <Clock size={16} color="#94a3b8" />
            <Text className="text-slate-400 text-[13px] font-semibold">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}
        <ChevronRight size={20} color="#475569" />
      </View>
    </TouchableOpacity>
  );
};
