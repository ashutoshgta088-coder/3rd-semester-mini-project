import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

const STATUS_COLORS = {
  PRESENT: '#10B981',
  ABSENT: '#EF4444',
  FLAGGED: '#F59E0B',
  MANUAL: '#6366F1'
};

const STATUS_ICONS = {
  PRESENT: '✅',
  ABSENT: '❌',
  FLAGGED: '⚠️',
  MANUAL: '✏️'
};

export default function AttendanceHistoryScreen({ onBack }) {
  const { theme } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [subjects, setSubjects] = useState([]);

  const fetchHistory = async () => {
    const params = new URLSearchParams();
    if (filterSubject !== 'ALL') params.append('subjectCode', filterSubject);
    if (filterStatus !== 'ALL') params.append('status', filterStatus);
    params.append('limit', '50');

    const res = await apiFetch(`/student/history?${params.toString()}`);
    if (res.success) {
      setHistory(res.history || []);
      // Extract unique subjects
      const subs = [...new Set((res.history || []).map(h => h.subjectCode))];
      setSubjects(subs);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [filterSubject, filterStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const presentCount = history.filter(h => h.status === 'PRESENT' || h.status === 'MANUAL').length;
  const absentCount = history.filter(h => h.status === 'ABSENT').length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Attendance History</Text>
          <Text style={styles.headerSub}>All lecture records</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Summary Bar */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }]}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#065F46' }}>{presentCount}</Text>
            <Text style={{ fontSize: 11, color: '#065F46' }}>Present</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#991B1B' }}>{absentCount}</Text>
            <Text style={{ fontSize: 11, color: '#991B1B' }}>Absent</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.accentPrimary }}>{history.length}</Text>
            <Text style={{ fontSize: 11, color: theme.textSecondary }}>Total</Text>
          </View>
        </View>

        {/* Filters */}
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Filter by Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {['ALL', 'PRESENT', 'ABSENT', 'MANUAL'].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, { backgroundColor: filterStatus === s ? theme.accentPrimary : theme.cardBackground, borderColor: filterStatus === s ? theme.accentPrimary : theme.border }]}
              onPress={() => setFilterStatus(s)}
            >
              <Text style={{ color: filterStatus === s ? '#FFF' : theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
                {s === 'ALL' ? 'All' : STATUS_ICONS[s] + ' ' + s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* History List */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {history.length} Records {filterStatus !== 'ALL' ? `— ${filterStatus}` : ''}
        </Text>

        {loading ? (
          <ActivityIndicator color={theme.accentPrimary} style={{ marginTop: 40 }} />
        ) : history.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 10, textAlign: 'center' }}>
              No attendance records found for selected filters.
            </Text>
          </View>
        ) : (
          history.map((item, idx) => (
            <View
              key={idx}
              style={[styles.historyCard, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderLeftColor: STATUS_COLORS[item.status] || theme.border }]}
            >
              <View style={styles.historyTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subjectCode, { color: theme.accentPrimary }]}>{item.subjectCode}</Text>
                  <Text style={[styles.subjectName, { color: theme.textPrimary }]}>
                    {item.subjectName || item.subjectCode}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || '#6B7280') + '20' }]}>
                  <Text style={{ color: STATUS_COLORS[item.status] || '#6B7280', fontWeight: '700', fontSize: 12 }}>
                    {STATUS_ICONS[item.status]} {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.historyMeta}>
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  📅 {item.date}
                </Text>
                {item.markedAt && (
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    ⏰ {new Date(item.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
                {item.distanceMeters != null && (
                  <Text style={[styles.metaText, { color: theme.accentSuccess }]}>
                    📍 {item.distanceMeters}m
                  </Text>
                )}
              </View>

              {item.facultyName && (
                <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>
                  Faculty: {item.facultyName}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20, paddingTop: 40,
    flexDirection: 'row', alignItems: 'center',
    borderBottomLeftRadius: 16, borderBottomRightRadius: 16
  },
  backBtn: { marginRight: 14, paddingVertical: 4 },
  backBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  headerSub: { color: '#C7D2FE', fontSize: 11, marginTop: 2 },
  content: { padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryCard: { width: '31%', padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  filterLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  filterRow: { flexDirection: 'row', marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, marginRight: 8
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  historyCard: {
    padding: 14, borderRadius: 12, borderWidth: 1,
    borderLeftWidth: 4, marginBottom: 10
  },
  historyTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  subjectCode: { fontSize: 12, fontWeight: '700' },
  subjectName: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  historyMeta: { flexDirection: 'row', gap: 12 },
  metaText: { fontSize: 11 }
});
