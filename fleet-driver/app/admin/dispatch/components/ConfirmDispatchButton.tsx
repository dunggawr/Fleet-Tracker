import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Send } from 'lucide-react-native';

interface ConfirmDispatchButtonProps {
  selectedOrderId: string | null;
  selectedVehicleId: string | null;
  isSubmitting: boolean;
  onConfirm: () => void;
}

const ConfirmDispatchButton: React.FC<ConfirmDispatchButtonProps> = ({
  selectedOrderId,
  selectedVehicleId,
  isSubmitting,
  onConfirm,
}) => {
  if (!selectedOrderId || !selectedVehicleId) return null;

  return (
    <View className="absolute bottom-10 left-6 right-6">
      <TouchableOpacity 
        onPress={onConfirm}
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
  );
};

export default ConfirmDispatchButton;
