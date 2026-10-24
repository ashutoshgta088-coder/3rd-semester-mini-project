import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ReportsScreen({ onBack }) {
  const { theme, user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const reportData = [
    { code: 'KCS-501', name: 'Web Technology', total: 24, attended: 22, percentage: 92, status: 'ELIGIBLE' },
    { code: 'KCS-502', name: 'Database Management Systems', total: 26, attended: 23, percentage: 88, status: 'ELIGIBLE' },
    { code: 'KCS-503', name: 'Design & Analysis of Algorithms', total: 28, attended: 21, percentage: 75, status: 'ELIGIBLE' },
    { code: 'KNC-501', name: 'Constitution of India', total: 15, attended: 11, percentage: 73, status: 'DEFAULTER' }
  ];

  const filteredData = selectedFilter === 'ALL'
    ? reportData
    : selectedFilter === 'ELIGIBLE'
      ? reportData.filter(r => r.percentage >= 75)
      : reportData.filter(r => r.percentage < 75);

  const handleExport = () => {
    Alert.alert(
      'Export Initiated',
      'Attendance summary has been compiled. In mobile, open the web portal at http://localhost:5000 to download the formatted Excel (.csv) file directly.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={[styles.backBtn, { borderColor: theme.border }]} onPress={onBack}>
          <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>Attendance Reports</Text>
        <TouchableOpacity style={[styles.exportBtn, { backgroundColor: theme.accentSuccess }]} onPress={handleExport}>
          <Text style={styles.exportBtnText}>📥 Export</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.kpiNum, { color: theme.accentPrimary }]}>93</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Total Lectures</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.kpiNum, { color: theme.accentSuccess }]}>82%</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Avg Attendance</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.kpiNum, { color: theme.accentDanger }]}>1</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Defaulter (&lt;75%)</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, selectedFilter === 'ALL' && { backgroundColor: theme.accentPrimary }]}
          onPress={() => setSelectedFilter('ALL')}
        >
          <Text style={[styles.filterText, selectedFilter === 'ALL' ? { color: '#FFF' } : { color: theme.textSecondary }]}>
            All Subjects
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, selectedFilter === 'ELIGIBLE' && { backgroundColor: theme.accentSuccess }]}
          onPress={() => setSelectedFilter('ELIGIBLE')}
        >
          <Text style={[styles.filterText, selectedFilter === 'ELIGIBLE' ? { color: '#FFF' } : { color: theme.textSecondary }]}>
            Eligible (&gt;=75%)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, selectedFilter === 'DEFAULTER' && { backgroundColor: theme.accentDanger }]}
          onPress={() => setSelectedFilter('DEFAULTER')}
        >
          <Text style={[styles.filterText, selectedFilter === 'DEFAULTER' ? { color: '#FFF' } : { color: theme.textSecondary }]}>
            Defaulters (&lt;75%)
          </Text>
        </TouchableOpacity>
      </View>

      {/* List of Report Cards */}
      {filteredData.map((item, idx) => (
        <View key={idx} style={[styles.reportCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.codeBadge, { backgroundColor: theme.border, color: theme.accentPrimary }]}>
                {item.code}
              </Text>
              <Text style={[styles.subName, { color: theme.textPrimary }]}>{item.name}</Text>
            </View>
            <Text style={[styles.pctText, { color: item.percentage >= 75 ? theme.accentSuccess : theme.accentDanger }]}>
              {item.percentage}%
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={[styles.statText, { color: theme.textSecondary }]}>
              Lectures: {item.attended} / {item.total} attended
            </Text>
            <Text
              style={[
                styles.badgeStatus,
                {
                  backgroundColor: item.percentage >= 75 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                  color: item.percentage >= 75 ? theme.accentSuccess : theme.accentDanger
                }
              ]}
            >
              {item.percentage >= 75 ? '✓ Eligible' : '⚠️ Defaulter'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  exportBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  exportBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center'
  },
  kpiNum: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  kpiLabel: {
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase'
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  filterText: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  reportCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  codeBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4
  },
  subName: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  pctText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  statText: {
    fontSize: 12
  },
  badgeStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  }
});
