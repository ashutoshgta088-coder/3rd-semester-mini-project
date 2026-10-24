import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

export default function MarkAttendanceScreen({ onBack }) {
  const { theme, user, deviceId } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [step, setStep] = useState(1); // 1: Select Session, 2: Geofence Check, 3: Biometric Auth, 4: Photo Match, 5: Result
  const [loading, setLoading] = useState(false);
  const [distanceMeters, setDistanceMeters] = useState(14.2); // Sample simulated distance
  const [biometricDone, setBiometricDone] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const fetchActiveSessions = async () => {
    setLoading(true);
    const res = await apiFetch('/attendance/active-sessions');
    if (res.success && res.sessions.length > 0) {
      setSessions(res.sessions);
      setSelectedSession(res.sessions[0]);
    }
    setLoading(false);
  };

  const handleStartGeofence = () => {
    if (!selectedSession) {
      setErrorMsg('No active attendance session available.');
      return;
    }
    setErrorMsg('');
    setStep(2);
    // Simulate high-precision GPS distance check
    setTimeout(() => {
      // 14.2m is within allowed 50m radius
      setDistanceMeters(14.2);
    }, 1000);
  };

  const handleBiometricCheck = () => {
    setLoading(true);
    // Simulate Android Biometric API Fingerprint/Face scan trigger
    setTimeout(() => {
      setBiometricDone(true);
      setLoading(false);
      setStep(4);
    }, 1200);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setErrorMsg('');

    const payload = {
      sessionId: selectedSession.sessionId,
      qrCodeToken: selectedSession.qrCodeToken,
      location: {
        latitude: 28.6139,
        longitude: 77.2090
      },
      biometricVerified: true,
      deviceId: deviceId
    };

    const res = await apiFetch('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    setLoading(false);
    if (res.success) {
      setStatusResult({
        success: true,
        message: res.message || 'Attendance Marked Successfully!',
        record: res.record
      });
      setStep(5);
    } else {
      setErrorMsg(res.message || 'Failed to mark attendance.');
      setStatusResult({
        success: false,
        message: res.message || 'Failed to mark attendance.'
      });
      setStep(5);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Bar */}
      <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mark Attendance</Text>
      </View>

      <View style={styles.content}>
        {/* Step Progress Tracker */}
        <View style={styles.trackerContainer}>
          {[1, 2, 3, 4, 5].map((st) => (
            <View
              key={st}
              style={[
                styles.stepCircle,
                {
                  backgroundColor: step >= st ? theme.accentPrimary : theme.border
                }
              ]}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>{st}</Text>
            </View>
          ))}
        </View>

        {errorMsg ? (
          <View style={[styles.alertBox, { backgroundColor: theme.accentDanger + '15' }]}>
            <Text style={{ color: theme.accentDanger, fontSize: 13 }}>⚠️ {errorMsg}</Text>
          </View>
        ) : null}

        {/* STEP 1: Select Active Session */}
        {step === 1 && (
          <View style={[styles.stepCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Step 1: Select Active Class Session</Text>
            <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
              Sessions are created live by your faculty member.
            </Text>

            {loading ? (
              <ActivityIndicator color={theme.accentPrimary} style={{ marginVertical: 20 }} />
            ) : sessions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📭</Text>
                <Text style={{ color: theme.textSecondary }}>No active attendance session currently open.</Text>
              </View>
            ) : (
              sessions.map((sess) => (
                <TouchableOpacity
                  key={sess.sessionId}
                  style={[
                    styles.sessionItem,
                    {
                      borderColor: selectedSession?.sessionId === sess.sessionId ? theme.accentPrimary : theme.border,
                      backgroundColor: selectedSession?.sessionId === sess.sessionId ? theme.accentPrimary + '10' : theme.background
                    }
                  ]}
                  onPress={() => setSelectedSession(sess)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sessionCode, { color: theme.accentPrimary }]}>{sess.subjectCode}</Text>
                    <Text style={[styles.sessionName, { color: theme.textPrimary }]}>{sess.subjectName}</Text>
                    <Text style={[styles.sessionMeta, { color: theme.textSecondary }]}>
                      Faculty: {sess.facultyName} • Radius: {sess.allowedRadiusMeters}m
                    </Text>
                  </View>
                  <View style={styles.liveTag}>
                    <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>● LIVE</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: selectedSession ? theme.accentPrimary : theme.border }
              ]}
              onPress={handleStartGeofence}
              disabled={!selectedSession}
            >
              <Text style={styles.primaryBtnText}>Next: GPS Geofence Check →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: GPS Geofence Verification */}
        {step === 2 && (
          <View style={[styles.stepCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Step 2: GPS Location Verification</Text>
            <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
              Calculating distance between your phone and teacher location (50m radius limit).
            </Text>

            <View style={styles.geoBox}>
              <Text style={{ fontSize: 48, marginVertical: 10 }}>📍</Text>
              <Text style={[styles.distanceText, { color: theme.accentSuccess }]}>{distanceMeters} Meters Away</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
                ✅ Within allowed 50-meter classroom radius!
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.accentPrimary }]}
              onPress={() => setStep(3)}
            >
              <Text style={styles.primaryBtnText}>Next: Biometric Unlock →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: Android Biometric Unlock */}
        {step === 3 && (
          <View style={[styles.stepCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Step 3: Biometric Authentication</Text>
            <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
              Use your device Fingerprint sensor or Face Unlock to prove identity.
            </Text>

            <View style={styles.bioBox}>
              <Text style={{ fontSize: 64, marginVertical: 10 }}>👆</Text>
              <Text style={[styles.bioText, { color: theme.textPrimary }]}>
                {loading ? 'Scanning Biometrics...' : 'Touch Fingerprint Sensor'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.accentPrimary }]}
              onPress={handleBiometricCheck}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Verify Fingerprint / Face</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: Photo & Profile Verification */}
        {step === 4 && (
          <View style={[styles.stepCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Step 4: Student Profile Verification</Text>
            <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
              Your registered photo will be logged with this attendance record.
            </Text>

            <View style={styles.photoBox}>
              <Image source={{ uri: user.profilePhotoUrl }} style={styles.studentImg} />
              <Text style={[styles.studentName, { color: theme.textPrimary }]}>{user.name}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>AKTU Roll: {user.identifier}</Text>
              <Text style={{ color: theme.accentSuccess, fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                ✓ Official Approved Photo
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.accentSuccess }]}
              onPress={handleFinalSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Submit Attendance Now ✓</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 5: Final Status Result */}
        {step === 5 && (
          <View style={[styles.stepCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={{ fontSize: 64, textAlign: 'center', marginVertical: 10 }}>
              {statusResult?.success ? '🎉' : '❌'}
            </Text>
            <Text
              style={[
                styles.resultTitle,
                { color: statusResult?.success ? theme.accentSuccess : theme.accentDanger }
              ]}
            >
              {statusResult?.success ? 'ATTENDANCE MARKED!' : 'ATTENDANCE FAILED'}
            </Text>
            <Text style={[styles.resultMsg, { color: theme.textSecondary }]}>
              {statusResult?.message}
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.accentPrimary, marginTop: 20 }]}
              onPress={onBack}
            >
              <Text style={styles.primaryBtnText}>Return to Dashboard</Text>
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
  trackerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  stepCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  stepDesc: {
    fontSize: 12,
    marginBottom: 16
  },
  emptyBox: {
    alignItems: 'center',
    padding: 30
  },
  sessionItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  sessionCode: {
    fontSize: 12,
    fontWeight: '700'
  },
  sessionName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2
  },
  sessionMeta: {
    fontSize: 11,
    marginTop: 2
  },
  liveTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 6
  },
  geoBox: {
    alignItems: 'center',
    padding: 24,
    marginVertical: 10
  },
  distanceText: {
    fontSize: 22,
    fontWeight: '800'
  },
  bioBox: {
    alignItems: 'center',
    padding: 24,
    marginVertical: 10
  },
  bioText: {
    fontSize: 16,
    fontWeight: '700'
  },
  photoBox: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 10
  },
  studentImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700'
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10
  },
  resultMsg: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6
  }
});
