import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Award, TrendingUp, Clock, Star, Users } from 'lucide-react-native';
import { useReportStore } from '../../../store/useReportStore';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { ExportButton } from '../../../components/admin/dashboard/ExportButton';

const screenWidth = Dimensions.get('window').width;

export default function DriverLeaderboardScreen() {
  const router = useRouter();
  const { driverKPIs, loading, fetchDriverKPIs } = useReportStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    await fetchDriverKPIs();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Sort KPIs by score descending
  const sortedKPIs = [...driverKPIs].sort((a, b) => b.score - a.score);

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const barData = {
    labels: sortedKPIs.map(d => d.driverName.split(' ').pop() || '') || [],
    datasets: [
      {
        data: sortedKPIs.map(d => d.score) || [],
      },
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-800 justify-center items-center mr-4 border border-slate-700"
          >
            <ArrowLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-slate-50">Driver Performance</Text>
            <Text className="text-slate-400 text-xs">KPI leaderboards and score card</Text>
          </View>
        </View>
        
        <ExportButton 
          reportName="kpi-leaderboard" 
          params={{}}
          color="#059669" 
        />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-slate-400 mt-4">Analyzing driver performance...</Text>
          </View>
        ) : (
          <>
            {/* Podium Top 3 */}
            {sortedKPIs.length >= 3 && (
              <View className="flex-row items-end justify-center mb-8 mt-6 px-2">
                {/* Top 2 - Silver */}
                <View className="bg-slate-900/50 border border-white/5 rounded-t-3xl p-4 w-[30%] items-center h-36 justify-between mr-2">
                  <View className="items-center">
                    <View className="w-10 h-10 rounded-full bg-slate-400/10 justify-center items-center mb-1">
                      <Award size={22} color="#94a3b8" />
                    </View>
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top 2</Text>
                  </View>
                  <Text className="text-slate-50 font-extrabold text-xs text-center" numberOfLines={1}>
                    {sortedKPIs[1]?.driverName}
                  </Text>
                  <View className="items-center">
                    <Text className="text-slate-400 font-black text-sm">{sortedKPIs[1]?.score} pts</Text>
                  </View>
                </View>

                {/* Top 1 - Gold */}
                <View className="bg-slate-900/60 border border-emerald-500/20 rounded-t-[32px] p-4 w-[34%] items-center h-44 justify-between shadow-lg shadow-emerald-500/5 z-10">
                  <View className="items-center">
                    <View className="w-12 h-12 rounded-full bg-yellow-500/10 justify-center items-center mb-1 border border-yellow-500/20">
                      <Award size={28} color="#eab308" />
                    </View>
                    <Text className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Winner</Text>
                  </View>
                  <Text className="text-slate-50 font-black text-sm text-center" numberOfLines={1}>
                    {sortedKPIs[0]?.driverName}
                  </Text>
                  <View className="items-center">
                    <Text className="text-emerald-600 font-black text-base">{sortedKPIs[0]?.score} pts</Text>
                  </View>
                </View>

                {/* Top 3 - Bronze */}
                <View className="bg-slate-900/50 border border-white/5 rounded-t-3xl p-4 w-[30%] items-center h-32 justify-between ml-2">
                  <View className="items-center">
                    <View className="w-8 h-8 rounded-full bg-amber-700/10 justify-center items-center mb-1">
                      <Award size={18} color="#b45309" />
                    </View>
                    <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Top 3</Text>
                  </View>
                  <Text className="text-slate-50 font-extrabold text-xs text-center" numberOfLines={1}>
                    {sortedKPIs[2]?.driverName}
                  </Text>
                  <View className="items-center">
                    <Text className="text-slate-400 font-black text-xs">{sortedKPIs[2]?.score} pts</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Score Comparison Chart */}
            <View className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 mb-8">
              <Text className="text-slate-50 font-bold mb-1">Score Comparison</Text>
              <Text className="text-slate-500 text-xs mb-6">Driver performance score comparison</Text>
              
              {sortedKPIs.length > 0 ? (
                <BarChart
                  data={barData}
                  width={screenWidth - 84}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=" pts"
                  chartConfig={chartConfig}
                  fromZero
                  showValuesOnTopOfBars
                  style={{ borderRadius: 16 }}
                />
              ) : (
                <View className="h-40 justify-center items-center">
                  <Text className="text-slate-600">No score data available</Text>
                </View>
              )}
            </View>

            {/* Detailed list standings */}
            <View className="mb-10">
              <Text className="text-slate-50 font-bold mb-4 px-2">Detailed Standings</Text>
              {sortedKPIs.map((item, index) => (
                <View 
                  key={item.driverId}
                  className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 justify-center items-center mr-3">
                      <Text className="text-slate-50 font-black text-xs">#{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-50 font-bold" numberOfLines={1}>{item.driverName}</Text>
                      <View className="flex-row items-center gap-3 mt-1">
                        <View className="flex-row items-center gap-1">
                          <TrendingUp size={10} color="#94a3b8" />
                          <Text className="text-slate-500 text-[10px] font-semibold">{item.totalTrips} Trips</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Clock size={10} color="#94a3b8" />
                          <Text className="text-slate-500 text-[10px] font-semibold">{item.onTimeRate}% On-Time</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className={`font-black text-base ${item.score >= 90 ? 'text-emerald-400' : item.score >= 80 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {item.score} pts
                    </Text>
                    <View className="flex-row items-center gap-0.5 mt-0.5">
                      <Star size={10} color="#f59e0b" fill="#f59e0b" />
                      <Text className="text-slate-500 text-[9px] font-bold">{item.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
