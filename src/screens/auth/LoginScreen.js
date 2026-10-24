import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { theme, login, toggleTheme, themeMode } = useAuth();
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'TEACHER' | 'ADMIN'
  const [identifier, setIdentifier] = useState('2100270100001');
  const [password, setPassword] = useState('studentpassword');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleSwitch = (selectedRole) => {
    setRole(selectedRole);
    setErrorMsg('');
    if (selectedRole === 'STUDENT') {
      setIdentifier('2100270100001');
      setPassword('studentpassword');
    } else if (selectedRole === 'TEACHER') {
      setIdentifier('T1001');
      setPassword('teacherpassword');
    } else {
      setIdentifier('admin');
      setPassword('adminpassword123');
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      setErrorMsg('Please enter both identifier and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login(identifier, password, role);
      if (!res.success) {
        setErrorMsg(res.message || 'Login failed.');
      }
    } catch (err) {
      setErrorMsg('Connection error during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Dark/Light mode toggle header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={[styles.themeBtn, { backgroundColor: theme.cardBackground }]} onPress={toggleTheme}>
          <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>
            {themeMode === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.logoContainer}>
          <Text style={[styles.appTitle, { color: theme.accentPrimary }]}>stuatten</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Smart Biometric Attendance System (AKTU)
          </Text>
        </View>

        {/* Role Selector Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: theme.background }]}>
          {['STUDENT', 'TEACHER', 'ADMIN'].map((tabRole) => (
            <TouchableOpacity
              key={tabRole}
              style={[
                styles.tab,
                role === tabRole && { backgroundColor: theme.accentPrimary }
              ]}
              onPress={() => handleRoleSwitch(tabRole)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: role === tabRole ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                {tabRole.charAt(0) + tabRole.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {errorMsg ? (
          <View style={[styles.errorBox, { backgroundColor: theme.accentDanger + '15' }]}>
            <Text style={{ color: theme.accentDanger, fontSize: 13 }}>⚠️ {errorMsg}</Text>
          </View>
        ) : null}

        {/* Input Fields */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>
            {role === 'STUDENT' ? 'AKTU Roll Number' : role === 'TEACHER' ? 'Faculty ID / Email' : 'Admin Username'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
            placeholder={role === 'STUDENT' ? 'e.g. 2100270100001' : role === 'TEACHER' ? 'e.g. T1001' : 'admin'}
            placeholderTextColor={theme.textSecondary}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
            placeholder="••••••••"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: theme.accentPrimary }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginBtnText}>Secure Login →</Text>
          )}
        </TouchableOpacity>

        {role === 'STUDENT' && (
          <TouchableOpacity style={styles.biometricBtn} onPress={handleLogin}>
            <Text style={{ color: theme.accentPrimary, fontSize: 13, textAlign: 'center', marginTop: 12 }}>
              👆 Touch Fingerprint / Face Unlock to Login
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Protected by Geofence & Device Lock Security
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  topBar: {
    position: 'absolute',
    top: 40,
    right: 20
  },
  themeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    elevation: 4
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600'
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 14
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15
  },
  loginBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  biometricBtn: {
    paddingVertical: 6
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 20
  }
});
