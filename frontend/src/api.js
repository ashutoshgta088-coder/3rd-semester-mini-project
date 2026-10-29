// ─── API Service ───────────────────────────────────────────────────────────────
// Communicates with the Node.js backend at /api/*

const isDev = typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '3000');
const isBackendHost = typeof window !== 'undefined' && window.location.hostname === 'stuatten-backend.onrender.com';
const BASE = isDev
  ? 'http://localhost:5000'
  : isBackendHost
    ? ''
    : 'https://stuatten-backend.onrender.com';

function getToken() {
  try { return localStorage.getItem('stuatten_token'); } catch { return null; }
}

async function api(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.warn('API error:', err);
    return { ok: false, status: 0, data: { message: 'Network error — server may be offline.' } };
  }
}

export const apiService = {
  // Auth
  login:          (id, password, role) => api('POST', '/auth/login', { id, identifier: id, password, role }),
  register:       (payload)            => api('POST', '/auth/register', payload),
  forgotPassword: (payload)            => api('POST', '/auth/forgot-password', payload),
  resetPassword:  (payload)            => api('POST', '/auth/reset-password', payload),

  // Teacher
  createSession:        (payload)     => api('POST', '/teacher/session/create', payload),
  startSession:         (id)          => api('POST', `/teacher/session/${id}/start`),
  closeSession:         (id)          => api('POST', `/teacher/session/${id}/close`),
  liveRoster:           (id)          => api('GET',  `/teacher/session/${id}/roster`),
  manualMark:           (id, sid, st) => api('POST', `/teacher/session/${id}/manual`, { studentId: sid, status: st }),
  teacherSessions:      ()            => api('GET',  '/teacher/sessions'),
  teacherProfile:       ()            => api('GET',  '/teacher/profile'),
  updateTeacherProfile: (payload)     => api('PUT',  '/teacher/profile', payload),
  stopActiveSessions:   ()            => api('POST', '/teacher/session/stop-active'),
  exportSession:        (id)          => `${BASE}/api/teacher/session/${id}/export`,

  // Student
  activeSessions: ()            => api('GET',  '/student/sessions/active'),
  markAttendance: (payload)     => api('POST', '/attendance/mark', payload),
  studentHistory: ()            => api('GET',  '/student/attendance/history'),
  studentProfile: ()            => api('GET',  '/student/profile'),

  // Admin
  adminStats:     ()            => api('GET',  '/admin/stats'),
  defaulters:     ()            => api('GET',  '/admin/defaulters'),
  auditLogs:      ()            => api('GET',  '/admin/audit-logs'),
  allSessions:    ()            => api('GET',  '/admin/sessions'),
};
