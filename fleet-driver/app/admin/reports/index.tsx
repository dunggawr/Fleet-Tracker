import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportsOverviewScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/reports/drivers' as any);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ActivityIndicator size="large" color="#6366f1" />
    </SafeAreaView>
  );
}
