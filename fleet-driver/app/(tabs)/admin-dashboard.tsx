import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { LayoutDashboard, Truck, Package, DollarSign, AlertTriangle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatCard } from '../../components/admin/StatCard';
import { useDashboardStore } from '../../store/useDashboardStore';

export default function AdminDashboardScreen() {
  const { stats, isLoading, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchStats} tintColor="#6366f1" />
        }
      >
        <View style={styles.header}>
          <LayoutDashboard size={32} color="#6366f1" />
          <Text style={styles.title}>Admin Dashboard</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard 
            title="Active Vehicles" 
            value={stats.activeVehicles} 
            icon={Truck} 
            color="#6366f1" 
            trend="+2 from yesterday"
          />
          <StatCard 
            title="Pending Orders" 
            value={stats.pendingOrders} 
            icon={Package} 
            color="#f59e0b" 
            trend="-5 since morning"
            trendColor="#f43f5e"
          />
          <StatCard 
            title="Revenue (Day)" 
            value={formatCurrency(stats.totalRevenue).split(',00')[0]} 
            icon={DollarSign} 
            color="#10b981" 
            trend="+12% vs last week"
          />
          <StatCard 
            title="Active Alerts" 
            value={stats.alertCount} 
            icon={AlertTriangle} 
            color="#ef4444" 
            trend={stats.alertCount > 0 ? "Requires attention" : "System clear"}
            trendColor={stats.alertCount > 0 ? "#ef4444" : "#10b981"}
          />
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        <View style={styles.placeholderCard}>
          {isLoading ? (
            <ActivityIndicator color="#6366f1" />
          ) : (
            <>
              <Text style={styles.placeholderText}>Detailed activity logs and mini charts will be added in future updates.</Text>
              <Text style={styles.statusBadge}>Phase 02 in Progress</Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Tab bar space
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  placeholderCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  statusBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
});
