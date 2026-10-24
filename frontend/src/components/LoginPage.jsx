import React, { useState } from 'react';
import { apiService } from '../api.js';

export default function LoginPage({ onLogin, onNavigate }) {
  const [role, setRole] = useState('STUDENT');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const DEMOS = {
    STUDENT: { id: '2100270100001', password: 'studentpassword' },
    TEACHER: { id: 'T1001',         password: 'teacherpassword' },
    ADMIN:   { id: 'admin',         password: 'adminpassword123' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await apiService.login(id, password, role);
    setLoading(false);
    if (res.ok && res.data.token) {
      onLogin(res.data.user || res.data, res.data.token);
    } else {
      setError(res.data.message || 'Login failed. Check credentials.');
    }
  };

  const fillDemo = () => {
    setId(DEMOS[role].id);
    setPassword(DEMOS[role].password);
  };

  return (
    <div className="container fade-in" style={{ maxWidth: 440, paddingTop: 48 }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48 }}>🎓</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.6rem', color: 'var(--primary)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Sign in to Stuatten Attendance System</p>
        </div>

        {/* Role Selector */}
        <div className="g3" style={{ marginBottom: 20 }}>
          {['STUDENT','TEACHER','ADMIN'].map(r => (
            <button
              key={r}
              className={`btn ${role === r ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '.75rem', padding: '8px 4px' }}
              onClick={() => setRole(r)}
            >
              {r === 'STUDENT' ? '👨‍🎓' : r === 'TEACHER' ? '👨‍🏫' : '🛡️'} {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label className="lbl">{role === 'STUDENT' ? 'Roll Number' : role === 'TEACHER' ? 'Teacher ID' : 'Admin ID'}</label>
            <input className="inp" value={id} onChange={e => setId(e.target.value)} placeholder={DEMOS[role].id} required />
          </div>
          <div className="fg">
            <label className="lbl">Password</label>
            <input className="inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
          </div>

          {error && <div style={{ color: 'var(--danger)', fontSize: '.85rem', marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,.08)', borderRadius: 8 }}>⚠️ {error}</div>}

          <button className="btn btn-primary btn-w" type="submit" disabled={loading}>
            {loading ? '⏳ Signing in...' : '🔑 Sign In'}
          </button>
        </form>

        <hr className="divider" />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={fillDemo} style={{ flex: 1 }}>
            ⚡ Fill Demo ({role})
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('REGISTER')} style={{ flex: 1 }}>
            📝 Register
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.75rem', marginTop: 14 }}>
          Demo credentials: Roll <strong>2100270100001</strong> / Teacher <strong>T1001</strong>
        </p>
      </div>
    </div>
  );
}
