import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Auth
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Student Screens
import StudentDashboard from './src/screens/student/StudentDashboard';
import MarkAttendanceScreen from './src/screens/student/MarkAttendanceScreen';
import StudentProfileScreen from './src/screens/student/StudentProfileScreen';
import AttendanceHistoryScreen from './src/screens/student/AttendanceHistoryScreen';
import NotificationsScreen from './src/screens/student/NotificationsScreen';

// Common Screens
import ReportsScreen from './src/screens/common/ReportsScreen';

// Teacher Screens
import TeacherDashboard from './src/screens/teacher/TeacherDashboard';
import CreateSessionScreen from './src/screens/teacher/CreateSessionScreen';
import LiveAttendanceScreen from './src/screens/teacher/LiveAttendanceScreen';
import TeacherSessionHistoryScreen from './src/screens/teacher/TeacherSessionHistoryScreen';

// Admin Screens
import AdminDashboard from './src/screens/admin/AdminDashboard';

function MainNavigator() {
  const { user, theme, themeMode } = useAuth();
  const [authView, setAuthView] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'
  const [currentScreen, setCurrentScreen] = useState('DASHBOARD');
  const [screenParams, setScreenParams] = useState({});

  if (!user) {
    if (authView === 'REGISTER') {
      return (
        <RegisterScreen
          onNavigateToLogin={() => setAuthView('LOGIN')}
          onBack={() => setAuthView('LOGIN')}
        />
      );
    }
    return <LoginScreen onNavigateToRegister={() => setAuthView('REGISTER')} />;
  }

  const navigate = (screen, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  const goBack = () => {
    setCurrentScreen('DASHBOARD');
    setScreenParams({});
  };

  const renderScreen = () => {
    // ── STUDENT ROLE ──────────────────────────────────────────────────────────
    if (user.role === 'STUDENT') {
      switch (currentScreen) {
        case 'MARK_ATTENDANCE':
          return <MarkAttendanceScreen onBack={goBack} />;
        case 'STUDENT_PROFILE':
          return <StudentProfileScreen onBack={goBack} />;
        case 'ATTENDANCE_HISTORY':
          return <AttendanceHistoryScreen onBack={goBack} />;
        case 'NOTIFICATIONS':
          return <NotificationsScreen onBack={goBack} />;
        case 'REPORTS':
          return <ReportsScreen onBack={goBack} />;
        default:
          return <StudentDashboard onNavigate={navigate} />;
      }
    }

    // ── TEACHER ROLE ──────────────────────────────────────────────────────────
    if (user.role === 'TEACHER') {
      switch (currentScreen) {
        case 'CREATE_SESSION':
          return (
            <CreateSessionScreen
              onBack={goBack}
              onNavigate={navigate}
            />
          );
        case 'LIVE_ATTENDANCE':
          return (
            <LiveAttendanceScreen
              onBack={goBack}
              sessionId={screenParams.sessionId}
            />
          );
        case 'SESSION_HISTORY':
          return (
            <TeacherSessionHistoryScreen
              onBack={goBack}
              onOpenRoster={(sessionId) => navigate('LIVE_ATTENDANCE', { sessionId })}
            />
          );
        case 'REPORTS':
          return <ReportsScreen onBack={goBack} />;
        default:
          return <TeacherDashboard onNavigate={navigate} />;
      }
    }

    // ── ADMIN ROLE ────────────────────────────────────────────────────────────
    if (user.role === 'ADMIN') {
      return <AdminDashboard onNavigate={navigate} />;
    }

    return <LoginScreen onNavigateToRegister={() => setAuthView('REGISTER')} />;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.headerBg}
      />
      {renderScreen()}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  }
});
