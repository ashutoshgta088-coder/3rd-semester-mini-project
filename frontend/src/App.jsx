import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

import Header          from './components/Header.jsx';
import LandingPage     from './components/LandingPage.jsx';
import LoginPage       from './components/LoginPage.jsx';
import RegisterPage    from './components/RegisterPage.jsx';
import TeacherDashboard from './components/TeacherDashboard.jsx';
import StudentDashboard from './components/StudentDashboard.jsx';
import AdminDashboard  from './components/AdminDashboard.jsx';

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // ─── State ───────────────────────────────────────────────────────────────
  const [user,  setUser]  = useState(() => {
    try { const u = localStorage.getItem('stuatten_user'); return u ? JSON.parse(u) : null; } catch { return null; }
  });
  const [page,  setPage]  = useState('HOME');
  const [theme, setTheme] = useState(() => localStorage.getItem('stuatten_theme') || 'light');
  const [toast, setToast] = useState(null);
  const [socket, setSocket] = useState(null);
  const [rtConnected, setRtConnected] = useState(false);

  // ─── Dark Mode — apply data-theme to <html> element ──────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stuatten_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // ─── Toast helper ─────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Socket.IO connection ─────────────────────────────────────────────────
  useEffect(() => {
    const serverUrl = window.location.port === '5173'
      ? 'http://localhost:5000'
      : window.location.hostname.includes('stuatten.onrender.com')
        ? 'https://stuatten-backend.onrender.com'
        : window.location.origin;

    const s = io(serverUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });
    s.on('connect',    () => { setRtConnected(true);  console.log('🟢 Socket.IO connected:', s.id); });
    s.on('disconnect', () => { setRtConnected(false); console.log('🔴 Socket.IO disconnected'); });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  // ─── Auth handlers ────────────────────────────────────────────────────────
  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('stuatten_user', JSON.stringify(userData));
    if (token) localStorage.setItem('stuatten_token', token);
    showToast(`👋 Welcome back, ${userData.fullName || userData.name}!`);
    // Open the home page after login completes
    setPage('HOME');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('stuatten_user');
    localStorage.removeItem('stuatten_token');
    setPage('HOME');
    showToast('Logged out successfully.');
  };

  // Navigate — allow open navigation between HOME, DASHBOARD, and auth pages
  const navigate = (p) => {
    if (p === 'DASHBOARD') {
      if (user) {
        const role = (user.role || '').toUpperCase();
        setPage(role === 'TEACHER' ? 'TEACHER' : role === 'ADMIN' ? 'ADMIN' : 'STUDENT');
      } else {
        setPage('LOGIN');
      }
      return;
    }
    setPage(p);
  };

  // ─── Demo quick login ─────────────────────────────────────────────────────
  // (Kept for convenience - these match server demo credentials)

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Header
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      {/* Real-time indicator (small dot in corner) */}
      <div style={{
        position: 'fixed', bottom: 8, left: 12,
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: '.7rem', color: 'var(--muted)', zIndex: 999
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: rtConnected ? 'var(--success)' : 'var(--danger)',
          display: 'inline-block'
        }} />
        {rtConnected ? 'Live' : 'Offline'}
      </div>

      <main>
        {page === 'HOME'     && <LandingPage  user={user} onNavigate={navigate} onLogout={handleLogout} />}
        {page === 'LOGIN'    && <LoginPage    onLogin={handleLogin} onNavigate={navigate} />}
        {page === 'REGISTER' && <RegisterPage onNavigate={navigate} />}
        {page === 'TEACHER'  && user && <TeacherDashboard user={user} socket={socket} />}
        {page === 'STUDENT'  && user && <StudentDashboard user={user} socket={socket} />}
        {page === 'ADMIN'    && user && <AdminDashboard   user={user} />}
      </main>

      <Toast message={toast} />
    </>
  );
}
