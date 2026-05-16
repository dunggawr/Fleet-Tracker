import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Package } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminOrdersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Package size={32} color="#f59e0b" />
          <Text style={styles.title}>Order Management</Text>
        </View>
        
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>Order list, creation, and assignment tools will be built here.</Text>
          <Text style={styles.statusBadge}>Phase 04 Coming Soon</Text>
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
  placeholderCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  statusBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
  },
});
