import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface OrderDateFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  showDateFilter: boolean;
}

export const OrderDateFilter: React.FC<OrderDateFilterProps> = ({
  startDate,
  endDate,
  onDateChange,
  showDateFilter,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (datePickerMode === 'start') {
        const d = new Date(selectedDate);
        d.setHours(0, 0, 0, 0);
        onDateChange(d, endDate);
      } else {
        const d = new Date(selectedDate);
        d.setHours(23, 59, 59, 999);
        onDateChange(startDate, d);
      }
    }
  };

  if (!showDateFilter) return null;

  return (
    <>
      <View className="mx-5 mb-4 p-4 bg-slate-900 rounded-3xl border border-slate-700/50 gap-3">
        <Text className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Lọc theo ngày tạo</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => {
              setDatePickerMode('start');
              setShowDatePicker(true);
            }}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl h-[44px] justify-center px-3"
            activeOpacity={0.7}
          >
            <Text className="text-slate-400 text-xs font-semibold mb-0.5">Từ ngày</Text>
            <Text className="text-slate-50 text-[13px] font-bold">
              {startDate ? startDate.toLocaleDateString('vi-VN') : '--/--/----'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setDatePickerMode('end');
              setShowDatePicker(true);
            }}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl h-[44px] justify-center px-3"
            activeOpacity={0.7}
          >
            <Text className="text-slate-400 text-xs font-semibold mb-0.5">Đến ngày</Text>
            <Text className="text-slate-50 text-[13px] font-bold">
              {endDate ? endDate.toLocaleDateString('vi-VN') : '--/--/----'}
            </Text>
          </TouchableOpacity>
        </View>

        {(startDate || endDate) && (
          <TouchableOpacity
            onPress={() => onDateChange(null, null)}
            className="bg-red-500/10 border border-red-500/20 rounded-xl h-[36px] justify-center items-center"
            activeOpacity={0.7}
          >
            <Text className="text-red-400 text-[13px] font-bold">Xoá bộ lọc ngày</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={datePickerMode === 'start' ? (startDate || new Date()) : (endDate || new Date())}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableOpacity 
            className="flex-1 justify-end bg-black/60"
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View className="bg-slate-900 rounded-t-3xl border border-slate-700 pb-8">
              <View className="flex-row justify-between items-center p-4 border-b border-slate-700">
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-base text-slate-500 font-semibold">Hủy</Text>
                </TouchableOpacity>
                <Text className="text-base font-bold text-slate-50">Chọn ngày</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-base text-indigo-500 font-bold">Xong</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={datePickerMode === 'start' ? (startDate || new Date()) : (endDate || new Date())}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  if (date) {
                    if (datePickerMode === 'start') {
                      const d = new Date(date);
                      d.setHours(0, 0, 0, 0);
                      onDateChange(d, endDate);
                    } else {
                      const d = new Date(date);
                      d.setHours(23, 59, 59, 999);
                      onDateChange(startDate, d);
                    }
                  }
                }}
                textColor="#fff"
                themeVariant="dark"
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};
