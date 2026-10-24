import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

export default function LiveAttendanceScreen({ onBack }) {
  const { theme } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample Live Roster State
  const [students, setStudents] = useState([
    {
      rollNumber: '2100270100001',
      fullName: 'Amit Kumar Singh',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      status: 'PRESENT',
      distanceMeters: 14.2,
      markedAt: '10:04 AM'
    },
    {
      rollNumber: '2100270100002',
      fullName: 'Priya Sharma',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      status: 'PRESENT',
      distanceMeters: 8.5,
      markedAt: '10:06 AM'
    },
    {
      rollNumber: '2100270100003',
      fullName: 'Rahul Verma',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      status: 'ABSENT',
      distanceMeters: null,
      markedAt: null
    },
    {
      rollNumber: '2100270100004',
      fullName: 'Sneha Patel',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      status: 'ABSENT',
      distanceMeters: null,
      markedAt: null
    }
  ]);

  const toggleStatus = (rollNumber) => {
    setStudents(prev =>
      prev.map(st => {
        if (st.rollNumber === rollNumber) {
          const nextStatus = st.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
          return {
            ...st,
            status: nextStatus,
            markedAt: nextStatus === 'PRESENT' ? 'Manual Override' : null
          };
        }
        return st;
      })
    );
  };

  const presentCount = students.filter(s => s.status === 'PRESENT').length;
  const absentCount = students.length - presentCount;

  const filteredStudents = students.filter(
    s => s.rollNumber.includes(searchQuery) || s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Session Attendance Roster</Text>
      </View>

      <View style={styles.content}>
        {/* Live Counters */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.subjectHeader, { color: theme.accentPrimary }]}>KCS-501: Web Technology</Text>
          <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 12 }}>
            Section A • Live 50m Geofence Lock Active
          </Text>

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: '#D1FAE5' }]}>
              <Text style={{ color: '#065F46', fontSize: 22, fontWeight: '800' }}>{presentCount}</Text>
              <Text style={{ color: '#065F46', fontSize: 11, fontWeight: '700' }}>PRESENT</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: '#FEE2E2' }]}>
              <Text style={{ color: '#991B1B', fontSize: 22, fontWeight: '800' }}>{absentCount}</Text>
              <Text style={{ color: '#991B1B', fontSize: 11, fontWeight: '700' }}>ABSENT</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: '#E0E7FF' }]}>
              <Text style={{ color: '#3730A3', fontSize: 22, fontWeight: '800' }}>
                {Math.round((presentCount / students.length) * 100)}%
              </Text>
              <Text style={{ color: '#3730A3', fontSize: 11, fontWeight: '700' }}>ATTENDANCE</Text>
            </View>
          </View>

          {/* Export Action Buttons */}
          <View style={styles.exportRow}>
            <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#059669' }]}>
              <Text style={styles.exportBtnText}>📊 Export Excel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#DC2626' }]}>
              <Text style={styles.exportBtnText}>📄 Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TextInput
          style={[styles.searchBar, { backgroundColor: theme.cardBackground, color: theme.textPrimary, borderColor: theme.border }]}
          placeholder="Search student by Roll No or Name..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Student Roster List */}
        {filteredStudents.map(st => (
          <View
            key={st.rollNumber}
            style={[styles.studentCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <Image source={{ uri: st.profilePhotoUrl }} style={styles.photo} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.studentName, { color: theme.textPrimary }]}>{st.fullName}</Text>
              <Text style={[styles.rollNo, { color: theme.textSecondary }]}>Roll No: {st.rollNumber}</Text>
              {st.distanceMeters && (
                <Text style={{ fontSize: 11, color: theme.accentSuccess, marginTop: 2 }}>
                  📍 Verified Distance: {st.distanceMeters}m ({st.markedAt})
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.statusBadge,
                { backgroundColor: st.status === 'PRESENT' ? '#D1FAE5' : '#FEE2E2' }
              ]}
              onPress={() => toggleStatus(st.rollNumber)}
            >
              <Text
                style={{
                  color: st.status === 'PRESENT' ? '#065F46' : '#991B1B',
                  fontWeight: '800',
                  fontSize: 12
                }}
              >
                {st.status} (Tap to Toggle)
              </Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center'
  },
  backBtn: {
    marginRight: 14
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  },
  content: {
    padding: 16
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  subjectHeader: {
    fontSize: 16,
    fontWeight: '700'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  statBox: {
    width: '31%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  exportBtn: {
    flex: 0.48,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  searchBar: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 13,
    marginBottom: 14
  },
  studentCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  photo: {
    width: 46,
    height: 46,
    borderRadius: 23
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700'
  },
  rollNo: {
    fontSize: 12
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10
  }
});
