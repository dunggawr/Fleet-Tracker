import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import {
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { ToastConfigParams } from 'react-native-toast-message';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TRUNCATE_LENGTH = 70;

interface ExpandableToastBodyProps {
  text1?: string;
  text2?: string;
  accentColor: string;
  icon: React.ReactNode;
  onPress?: () => void;
}

const ExpandableToastBody: React.FC<ExpandableToastBodyProps> = ({
  text1,
  text2,
  accentColor,
  icon,
  onPress,
}) => {
  const isLong = (text2?.length ?? 0) > TRUNCATE_LENGTH;
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    if (isLong) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded((prev) => !prev);
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      className="flex-row items-start bg-slate-800 rounded-2xl mx-3 px-4 py-3 shadow-lg min-h-[60px]"
      style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}
      onPress={handlePress}
      activeOpacity={isLong ? 0.7 : 1}
    >
      {/* Icon */}
      <View className="mr-3 mt-0.5">{icon}</View>

      {/* Text Block */}
      <View className="flex-1">
        {!!text1 && (
          <Text className="text-slate-100 font-bold text-sm mb-0.5" numberOfLines={1}>
            {text1}
          </Text>
        )}
        {!!text2 && (
          <Text
            className={`text-[13px] leading-[18px] ${expanded ? 'text-slate-300' : 'text-slate-400'}`}
            numberOfLines={expanded ? undefined : 2}
          >
            {text2}
          </Text>
        )}
        {isLong && (
          <View className="flex-row items-center mt-1 gap-1">
            {expanded ? (
              <ChevronUp size={12} color="#94a3b8" />
            ) : (
              <ChevronDown size={12} color="#94a3b8" />
            )}
            <Text className="text-[11px] text-slate-400 italic">
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Config để truyền vào <Toast config={...} /> ─────────────────────────────

export const toastConfig = {
  success: (props: ToastConfigParams<any>) => (
    <ExpandableToastBody
      text1={props.text1}
      text2={props.text2}
      accentColor="#22c55e"
      icon={<CheckCircle size={22} color="#22c55e" />}
      onPress={props.onPress}
    />
  ),

  error: (props: ToastConfigParams<any>) => (
    <ExpandableToastBody
      text1={props.text1}
      text2={props.text2}
      accentColor="#ef4444"
      icon={<XCircle size={22} color="#ef4444" />}
      onPress={props.onPress}
    />
  ),

  info: (props: ToastConfigParams<any>) => (
    <ExpandableToastBody
      text1={props.text1}
      text2={props.text2}
      accentColor="#3b82f6"
      icon={<Info size={22} color="#3b82f6" />}
      onPress={props.onPress}
    />
  ),
};
