import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Users } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminFleetScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Users size={32} color="#6366f1" />
          <Text style={styles.title}>Fleet Management</Text>
        </View>
        
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>Drivers and Vehicles list will be here.</Text>
          <Text style={styles.statusBadge}>Phase 05 Coming Soon</Text>
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
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
});
