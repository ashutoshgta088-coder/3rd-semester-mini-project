import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

export default function TeacherSessionHistoryScreen({ onBack, onOpenRoster }) {
  const { theme } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterActive, setFilterActive] = useState('ALL'); // ALL | ACTIVE | CLOSED

  const fetchSessions = async () => {
    const res = await apiFetch('/teacher/sessions');
    if (res.success) {
      setSessions(res.sessions || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  const closeSession = async (sessionId) => {
    await apiFetch(`/teacher/session/${sessionId}/close`, { method: 'POST', body: JSON.stringify({}) });
    fetchSessions();
  };

  const filteredSessions = sessions.filter(s => {
    if (filterActive === 'ACTIVE') return s.isActive;
    if (filterActive === 'CLOSED') return !s.isActive;
    return true;
  });

  const activeSessions = sessions.filter(s => s.isActive).length;

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
          <Text style={styles.headerTitle}>Session History</Text>
          <Text style={styles.headerSub}>{activeSessions} active • {sessions.length} total</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Filter Tabs */}
        <View style={[styles.tabRow, { backgroundColor: theme.cardBackground }]}>
          {['ALL', 'ACTIVE', 'CLOSED'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.tab, filterActive === f && { backgroundColor: theme.accentPrimary }]}
              onPress={() => setFilterActive(f)}
            >
              <Text style={[styles.tabText, { color: filterActive === f ? '#FFF' : theme.textSecondary }]}>
                {f === 'ACTIVE' ? '🟢 Active' : f === 'CLOSED' ? '🔴 Closed' : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={theme.accentPrimary} style={{ marginTop: 40 }} />
        ) : filteredSessions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 40 }}>📋</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 10 }}>No sessions found.</Text>
          </View>
        ) : (
          filteredSessions.map((sess) => (
            <View
              key={sess.sessionId}
              style={[styles.sessionCard, { backgroundColor: theme.cardBackground, borderColor: sess.isActive ? theme.accentPrimary + '60' : theme.border }]}
            >
              <View style={styles.sessionTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subCode, { color: theme.accentPrimary }]}>{sess.subjectCode}</Text>
                  <Text style={[styles.subName, { color: theme.textPrimary }]}>{sess.subjectName}</Text>
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    {sess.branch} • {sess.section} • {sess.semester}
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: sess.isActive ? '#D1FAE5' : '#F3F4F6' }]}>
                  <Text style={{ color: sess.isActive ? '#065F46' : '#6B7280', fontWeight: '700', fontSize: 11 }}>
                    {sess.isActive ? '● LIVE' : '⏸ CLOSED'}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statItem, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#065F46' }}>
                    {sess.presentCount || 0}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#065F46' }}>Present</Text>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>📅 {sess.date}</Text>
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    ⏰ {sess.startTime} – {sess.endTime}
                  </Text>
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    📍 {sess.allowedRadiusMeters}m radius
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.accentPrimary }]}
                  onPress={() => onOpenRoster && onOpenRoster(sess.sessionId)}
                >
                  <Text style={styles.actionBtnText}>View Roster</Text>
                </TouchableOpacity>

                {sess.isActive && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EF4444', marginLeft: 8 }]}
                    onPress={() => closeSession(sess.sessionId)}
                  >
                    <Text style={styles.actionBtnText}>Close Session</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#059669', marginLeft: 8 }]}
                  onPress={() => {
                    const url = `/api/teacher/session/${sess.sessionId}/export/excel`;
                    // Web: open in new tab / Native: use Linking
                    if (typeof window !== 'undefined') window.open(url, '_blank');
                  }}
                >
                  <Text style={styles.actionBtnText}>Excel</Text>
                </TouchableOpacity>
              </View>
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
    padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center',
    borderBottomLeftRadius: 16, borderBottomRightRadius: 16
  },
  backBtn: { marginRight: 14 },
  backBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  headerSub: { color: '#C7D2FE', fontSize: 11, marginTop: 2 },
  content: { padding: 16 },
  tabRow: {
    flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabText: { fontSize: 12, fontWeight: '600' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  sessionCard: {
    padding: 16, borderRadius: 16, borderWidth: 1.5, marginBottom: 14
  },
  sessionTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  subCode: { fontSize: 12, fontWeight: '800' },
  subName: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  metaText: { fontSize: 11, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statItem: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  actionRow: { flexDirection: 'row' },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 }
});
