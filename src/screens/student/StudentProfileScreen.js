import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

export default function StudentProfileScreen({ onBack }) {
  const { theme, user, setUser } = useAuth();
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handlePhotoRequest = async () => {
    if (!newPhotoUrl) return;
    setLoading(true);
    const res = await apiFetch('/student/photo-request', {
      method: 'POST',
      body: JSON.stringify({ photoUrl: newPhotoUrl })
    });
    setLoading(false);

    if (res.success) {
      setMsg('Photo update request submitted! Pending teacher approval.');
      if (res.student) {
        setUser({ ...user, photoApproved: false });
      }
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Profile</Text>
      </View>

      <View style={styles.content}>
        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.avatarSection}>
            <Image source={{ uri: user.profilePhotoUrl }} style={styles.avatar} />
            <View style={[styles.statusBadge, { backgroundColor: user.photoApproved ? '#D1FAE5' : '#FEF3C7' }]}>
              <Text style={{ color: user.photoApproved ? '#065F46' : '#92400E', fontSize: 11, fontWeight: '700' }}>
                {user.photoApproved ? '✓ Official Verified Photo' : '⏳ Pending Approval'}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>AKTU Academic Credentials</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name:</Text>
            <Text style={[styles.value, { color: theme.textPrimary }]}>{user.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>AKTU Roll Number:</Text>
            <Text style={[styles.value, { color: theme.accentPrimary, fontWeight: '800' }]}>{user.identifier}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Branch:</Text>
            <Text style={[styles.value, { color: theme.textPrimary }]}>{user.branch || 'CSE'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Year / Semester:</Text>
            <Text style={[styles.value, { color: theme.textPrimary }]}>{user.semester || '5th Sem'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Section:</Text>
            <Text style={[styles.value, { color: theme.textPrimary }]}>{user.section || 'A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address:</Text>
            <Text style={[styles.value, { color: theme.textPrimary }]}>{user.email}</Text>
          </View>
        </View>

        {/* Update Photo Section */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, marginTop: 16 }]}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Update Profile Photo</Text>
          <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 12 }}>
            Upload a clear official photo. Requires teacher/admin approval before being used for biometric verification.
          </Text>

          {msg ? <Text style={{ color: theme.accentSuccess, fontSize: 12, marginBottom: 10 }}>{msg}</Text> : null}

          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
            placeholder="Paste Image URL (e.g. https://...)"
            placeholderTextColor={theme.textSecondary}
            value={newPhotoUrl}
            onChangeText={setNewPhotoUrl}
          />

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.accentPrimary }]}
            onPress={handlePhotoRequest}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Request Photo Update</Text>}
          </TouchableOpacity>
        </View>
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
    padding: 20,
    borderRadius: 16,
    borderWidth: 1
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  label: {
    fontSize: 13
  },
  value: {
    fontSize: 13,
    fontWeight: '600'
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 10
  },
  btn: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  }
});
