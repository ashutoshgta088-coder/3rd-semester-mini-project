import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

const TYPE_ICONS = { INFO: 'ℹ️', WARNING: '⚠️', ATTENDANCE: '✅', APPROVAL: '🔔' };
const TYPE_COLORS = { INFO: '#3B82F6', WARNING: '#F59E0B', ATTENDANCE: '#10B981', APPROVAL: '#8B5CF6' };

export default function NotificationsScreen({ onBack }) {
  const { theme } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const res = await apiFetch('/student/notifications');
    if (res.success) {
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markRead = async (notificationId) => {
    await apiFetch('/student/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ notificationId })
    });
    setNotifications(prev =>
      prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

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
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={theme.accentPrimary} style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
            <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
              No notifications yet. Your attendance updates will appear here.
            </Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <TouchableOpacity
              key={notif._id}
              style={[
                styles.notifCard,
                {
                  backgroundColor: notif.isRead ? theme.cardBackground : theme.accentPrimary + '08',
                  borderColor: notif.isRead ? theme.border : theme.accentPrimary + '40',
                  borderLeftColor: TYPE_COLORS[notif.type] || theme.accentPrimary
                }
              ]}
              onPress={() => !notif.isRead && markRead(notif._id)}
              activeOpacity={0.8}
            >
              <View style={styles.notifTop}>
                <Text style={{ fontSize: 20, marginRight: 10 }}>{TYPE_ICONS[notif.type] || '🔔'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.notifTitle, { color: theme.textPrimary }]}>
                    {notif.title}
                    {!notif.isRead && (
                      <Text style={{ color: theme.accentPrimary }}> •</Text>
                    )}
                  </Text>
                  <Text style={[styles.notifMsg, { color: theme.textSecondary }]}>{notif.message}</Text>
                </View>
              </View>
              <View style={styles.notifFooter}>
                <Text style={[styles.notifTime, { color: theme.textSecondary }]}>
                  {formatTime(notif.createdAt)}
                </Text>
                {!notif.isRead && (
                  <Text style={{ color: theme.accentPrimary, fontSize: 11, fontWeight: '600' }}>
                    Tap to mark read
                  </Text>
                )}
              </View>
            </TouchableOpacity>
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
  badge: {
    backgroundColor: '#EF4444', borderRadius: 12,
    minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6
  },
  content: { padding: 16 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  notifCard: {
    padding: 14, borderRadius: 12, borderWidth: 1,
    borderLeftWidth: 4, marginBottom: 10
  },
  notifTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  notifTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  notifMsg: { fontSize: 13, lineHeight: 18 },
  notifFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTime: { fontSize: 11 }
});
