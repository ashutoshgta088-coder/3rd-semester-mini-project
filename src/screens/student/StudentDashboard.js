import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

export default function StudentDashboard({ onNavigate }) {
  const { theme, user, logout } = useAuth();
  const [overview, setOverview] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async () => {
    const res = await apiFetch('/student/overview');
    if (res.success) {
      setOverview(res);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOverview();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Top Banner Profile Card */}
      <View style={[styles.profileHeader, { backgroundColor: theme.headerBg }]}>
        <View style={styles.profileRow}>
          <Image source={{ uri: user.profilePhotoUrl }} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRoll}>AKTU Roll No: {user.identifier}</Text>
            <Text style={styles.userDetails}>
              {user.branch} • {user.semester} ({user.section})
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Stats Card */}
      <View style={styles.content}>
        <View style={[styles.pctCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.pctLabel, { color: theme.textSecondary }]}>Overall Attendance</Text>
            <Text
              style={[
                styles.pctValue,
                { color: (overview?.overallPercentage || 86) < 75 ? theme.accentDanger : theme.accentSuccess }
              ]}
            >
              {overview ? overview.overallPercentage : 86}%
            </Text>
            {overview?.isDefaulter && (
              <View style={[styles.defaulterBadge, { backgroundColor: theme.accentDanger + '20' }]}>
                <Text style={{ color: theme.accentDanger, fontSize: 12, fontWeight: '700' }}>
                  ⚠️ DEFAULTER WARNING (&lt; 75%)
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.accentPrimary }]}
            onPress={() => onNavigate('MARK_ATTENDANCE')}
          >
            <Text style={styles.actionBtnText}>⚡ Mark Attendance</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => onNavigate('STUDENT_PROFILE')}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>👤</Text>
            <Text style={[styles.navCardTitle, { color: theme.textPrimary }]}>My Profile</Text>
            <Text style={{ fontSize: 11, color: theme.textSecondary }}>Verification & Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => onNavigate('MARK_ATTENDANCE')}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>📍</Text>
            <Text style={[styles.navCardTitle, { color: theme.textPrimary }]}>Active Session</Text>
            <Text style={{ fontSize: 11, color: theme.textSecondary }}>50m Geofence Lock</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => onNavigate('ATTENDANCE_HISTORY')}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>📊</Text>
            <Text style={[styles.navCardTitle, { color: theme.textPrimary }]}>History</Text>
            <Text style={{ fontSize: 11, color: theme.textSecondary }}>All lecture records</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => onNavigate('NOTIFICATIONS')}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>🔔</Text>
            <Text style={[styles.navCardTitle, { color: theme.textPrimary }]}>Alerts</Text>
            <Text style={{ fontSize: 11, color: theme.textSecondary }}>Notifications & updates</Text>
          </TouchableOpacity>
        </View>


        {/* Subject-Wise Breakdown List */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Subject-Wise Attendance</Text>
        {overview?.subjectStats?.map((item) => (
          <View
            key={item.subjectCode}
            style={[styles.subjectCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <View style={styles.subjectHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subjectCode, { color: theme.accentPrimary }]}>{item.subjectCode}</Text>
                <Text style={[styles.subjectName, { color: theme.textPrimary }]}>{item.subjectName}</Text>
              </View>
              <Text
                style={[
                  styles.subjectPct,
                  { color: item.percentage < 75 ? theme.accentDanger : theme.accentSuccess }
                ]}
              >
                {item.percentage}%
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: item.percentage < 75 ? theme.accentDanger : theme.accentSuccess
                  }
                ]}
              />
            </View>

            <Text style={[styles.subjectDetails, { color: theme.textSecondary }]}>
              Attended {item.attended} of {item.totalLectures} lectures held
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  profileHeader: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  },
  userRoll: {
    color: '#E0E7FF',
    fontSize: 12,
    marginTop: 2
  },
  userDetails: {
    color: '#C7D2FE',
    fontSize: 11,
    marginTop: 2
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  content: {
    padding: 16
  },
  pctCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2
  },
  pctLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  pctValue: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 2
  },
  defaulterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  navCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center'
  },
  navCardTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12
  },
  subjectCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  subjectCode: {
    fontSize: 12,
    fontWeight: '700'
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2
  },
  subjectPct: {
    fontSize: 20,
    fontWeight: '800'
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressBar: {
    height: '100%',
    borderRadius: 4
  },
  subjectDetails: {
    fontSize: 11
  }
});
