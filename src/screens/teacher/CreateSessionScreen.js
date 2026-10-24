import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

export default function CreateSessionScreen({ onBack, onNavigate }) {
  const { theme } = useAuth();
  const [subjectCode, setSubjectCode] = useState('KCS-501');
  const [subjectName, setSubjectName] = useState('Web Technology');
  const [branch, setBranch] = useState('CSE');
  const [section, setSection] = useState('A');
  const [radius, setRadius] = useState('50');
  const [duration, setDuration] = useState('60');
  const [loading, setLoading] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(null);
  const [msg, setMsg] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    setMsg('');

    const payload = {
      subjectCode,
      subjectName,
      branch,
      section,
      allowedRadiusMeters: Number(radius) || 50,
      durationMinutes: Number(duration) || 60,
      location: {
        latitude: 28.6139, // Teacher device GPS lock simulation
        longitude: 77.2090
      }
    };

    const res = await apiFetch('/teacher/session/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    setLoading(false);
    if (res.success) {
      setSessionCreated(res.session);
      setMsg('Session launched! QR code active and 50m Geofence engaged.');
    } else {
      setMsg(res.message || 'Error creating session.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Attendance Session</Text>
      </View>

      <View style={styles.content}>
        {!sessionCreated ? (
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.heading, { color: theme.textPrimary }]}>Session Parameters</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Subject Code</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
                value={subjectCode}
                onChangeText={setSubjectCode}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Subject Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
                value={subjectName}
                onChangeText={setSubjectName}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>Branch</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
                  value={branch}
                  onChangeText={setBranch}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>Section</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
                  value={section}
                  onChangeText={setSection}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>Geofence Radius (Meters)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
                  value={radius}
                  onChangeText={setRadius}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>Duration (Minutes)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.gpsBanner}>
              <Text style={{ fontSize: 12, color: '#065F46', fontWeight: '600' }}>
                📍 Teacher Location Lock: 28.6139° N, 77.2090° E (Acquired)
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: theme.accentPrimary }]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>🚀 Launch Active Session</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, alignItems: 'center' }]}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.accentSuccess, marginBottom: 8 }}>
              ✅ SESSION ACTIVE!
            </Text>

            {/* Simulated Session QR Code */}
            <View style={styles.qrContainer}>
              <Text style={{ fontSize: 80, marginVertical: 10 }}>🔳</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textPrimary }}>
                Session QR Code: {sessionCreated.qrCodeToken}
              </Text>
            </View>

            <Text style={{ fontSize: 13, color: theme.textSecondary, marginVertical: 10, textAlign: 'center' }}>
              Students in room within {sessionCreated.allowedRadiusMeters} meters can now scan & verify biometrics.
            </Text>

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: theme.accentPrimary, width: '100%', marginTop: 10 }]}
              onPress={() => onNavigate('LIVE_ATTENDANCE')}
            >
              <Text style={styles.btnText}>📡 Open Live Attendance Roster →</Text>
            </TouchableOpacity>
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
  heading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16
  },
  formGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14
  },
  row: {
    flexDirection: 'row'
  },
  gpsBanner: {
    padding: 10,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    marginVertical: 10
  },
  createBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center'
  }
});
