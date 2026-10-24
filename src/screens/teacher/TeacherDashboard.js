import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard({ onNavigate }) {
  const { theme, user, logout } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.facultyTitle}>Faculty Portal</Text>
            <Text style={styles.facultyName}>{user.name}</Text>
            <Text style={styles.facultyDept}>Dept: {user.department || 'CSE'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Quick Launch Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.cardHeading, { color: theme.textPrimary }]}>Attendance Session Controller</Text>
          <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
            Create a live attendance session with 50m geofencing lock and QR code for students.
          </Text>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.accentPrimary }]}
            onPress={() => onNavigate('CREATE_SESSION')}
          >
            <Text style={styles.primaryBtnText}>➕ Create New Attendance Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: theme.accentPrimary, marginTop: 10 }]}
            onPress={() => onNavigate('LIVE_ATTENDANCE')}
          >
            <Text style={{ color: theme.accentPrimary, fontWeight: '700', fontSize: 14 }}>
              📡 View Live Session Roster
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: theme.accentSuccess, marginTop: 10 }]}
            onPress={() => onNavigate('SESSION_HISTORY')}
          >
            <Text style={{ color: theme.accentSuccess, fontWeight: '700', fontSize: 14 }}>
              📋 Session History & Reports
            </Text>
          </TouchableOpacity>
        </View>

        {/* Assigned Subjects Card */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Assigned AKTU Subjects</Text>
        {(user.assignedSubjects || ['KCS-501', 'KCS-502']).map((code) => (
          <View
            key={code}
            style={[styles.subjectItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.code, { color: theme.accentPrimary }]}>{code}</Text>
              <Text style={[styles.subName, { color: theme.textPrimary }]}>
                {code === 'KCS-501' ? 'Web Technology' : 'Database Management Systems'}
              </Text>
              <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                CSE • 5th Semester • Sec A & B
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={{ color: theme.accentPrimary, fontSize: 12, fontWeight: '700' }}>60 Students</Text>
            </View>
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
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  facultyTitle: {
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: '600'
  },
  facultyName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700'
  },
  facultyDept: {
    color: '#E0E7FF',
    fontSize: 12,
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
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20
  },
  cardHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 12,
    marginBottom: 16
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12
  },
  subjectItem: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  code: {
    fontSize: 12,
    fontWeight: '700'
  },
  subName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8
  }
});
