import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

export default function AdminDashboard({ onNavigate }) {
  const { theme, logout } = useAuth();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('ANALYTICS'); // 'ANALYTICS' | 'DEFAULTERS' | 'PHOTOS' | 'AUDIT'

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await apiFetch('/admin/stats');
    if (res.success) {
      setData(res);
    }
  };

  const handlePhotoApprove = async (rollNumber, action) => {
    await apiFetch('/admin/approve-photo', {
      method: 'POST',
      body: JSON.stringify({ rollNumber, action })
    });
    fetchStats();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Admin Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.adminTitle}>AKTU College Admin Portal</Text>
            <Text style={styles.adminSub}>System Management & Analytics</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {['ANALYTICS', 'DEFAULTERS', 'PHOTOS', 'AUDIT'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && { backgroundColor: theme.accentPrimary }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={{ color: activeTab === tab ? '#FFF' : '#C7D2FE', fontWeight: '700', fontSize: 12 }}>
                {tab === 'PHOTOS' ? `Photo Approvals (${data?.stats?.pendingPhotosCount || 0})` : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {/* ANALYTICS TAB */}
        {activeTab === 'ANALYTICS' && (
          <View>
            <View style={styles.statsGrid}>
              <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: theme.accentPrimary }}>
                  {data?.stats?.totalStudents || 480}
                </Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Total Students</Text>
              </View>

              <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: theme.accentSuccess }}>
                  {data?.stats?.totalTeachers || 34}
                </Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Faculty Members</Text>
              </View>

              <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: theme.accentDanger }}>
                  {data?.stats?.defaulterCount || 18}
                </Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Defaulter Students (&lt;75%)</Text>
              </View>

              <View style={[styles.gridCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: theme.accentWarning }}>
                  {data?.stats?.totalSubjects || 42}
                </Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Active Subjects</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>AKTU Department Overview</Text>
            {['Computer Science & Engg (CSE)', 'Electronics & Comm (ECE)', 'Mechanical Engg (ME)'].map(dept => (
              <View
                key={dept}
                style={[styles.deptCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary }}>{dept}</Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                  Sections: A, B • Avg Attendance: 84%
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* DEFAULTERS TAB */}
        {activeTab === 'DEFAULTERS' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Defaulter Students (&lt; 75% Attendance)</Text>
            {data?.defaultersList?.map(item => (
              <View
                key={item.rollNumber}
                style={[styles.defaulterCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary }}>{item.fullName}</Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary }}>Roll No: {item.rollNumber}</Text>
                  <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                    {item.branch} • Section {item.section}
                  </Text>
                </View>

                <View style={[styles.badg, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={{ color: '#991B1B', fontWeight: '800', fontSize: 14 }}>{item.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* PHOTO APPROVALS TAB */}
        {activeTab === 'PHOTOS' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Pending Profile Photo Approvals</Text>
            {data?.pendingPhotos?.length === 0 ? (
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 20 }}>
                No pending photo approval requests.
              </Text>
            ) : (
              data?.pendingPhotos?.map(st => (
                <View
                  key={st.rollNumber}
                  style={[styles.photoApprovalCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                >
                  <Image source={{ uri: st.photoPendingUrl || st.profilePhotoUrl }} style={styles.reqPhoto} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary }}>{st.fullName}</Text>
                    <Text style={{ fontSize: 12, color: theme.textSecondary }}>AKTU Roll: {st.rollNumber}</Text>

                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                      <TouchableOpacity
                        style={[styles.apprBtn, { backgroundColor: '#10B981', marginRight: 8 }]}
                        onPress={() => handlePhotoApprove(st.rollNumber, 'APPROVE')}
                      >
                        <Text style={styles.btnText}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.apprBtn, { backgroundColor: '#EF4444' }]}
                        onPress={() => handlePhotoApprove(st.rollNumber, 'REJECT')}
                      >
                        <Text style={styles.btnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'AUDIT' && (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Security & Attendance Audit Logs</Text>
            {data?.recentLogs?.map((log, idx) => (
              <View
                key={idx}
                style={[styles.logItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.accentPrimary }}>{log.action}</Text>
                <Text style={{ fontSize: 11, color: theme.textPrimary, marginTop: 2 }}>
                  User: {log.userId} ({log.userRole})
                </Text>
                <Text style={{ fontSize: 10, color: theme.textSecondary, marginTop: 2 }}>
                  {new Date(log.timestamp || Date.now()).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  adminTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800'
  },
  adminSub: {
    color: '#C7D2FE',
    fontSize: 11
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
  tabScroll: {
    flexDirection: 'row'
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  content: {
    padding: 16
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  gridCard: {
    width: '48%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12
  },
  deptCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8
  },
  defaulterCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  badg: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  photoApprovalCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12
  },
  reqPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  apprBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  logItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8
  }
});
