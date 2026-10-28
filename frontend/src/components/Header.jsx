import React from 'react';

export default function Header({ user, theme, onToggleTheme, onNavigate, onLogout }) {
  return (
    <div className="app-header">
      <span className="hdr-brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('HOME')}>
        🎓 Stuatten
      </span>
      <div className="hdr-btns">
        <button className="hdr-btn" onClick={onToggleTheme}>
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
        {!user && <>
          <button className="hdr-btn" onClick={() => onNavigate('HOME')}>🏠 Home</button>
          <button className="hdr-btn" onClick={() => onNavigate('LOGIN')}>🔑 Login</button>
          <button className="hdr-btn" onClick={() => onNavigate('REGISTER')}>📝 Register</button>
        </>}
        {user && <>
          <button className="hdr-btn" onClick={() => onNavigate('HOME')}>🏠 Home</button>
          <button className="hdr-btn" style={{ background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 700 }} onClick={() => onNavigate('DASHBOARD')}>
            📊 Dashboard
          </button>
          <span style={{ fontSize: '0.78rem', opacity: 0.9, fontWeight: 600 }}>
            👤 {user.fullName || user.name} ({user.role})
          </span>
          <button className="hdr-btn" style={{ background: 'rgba(239,68,68,.3)', border: '1px solid rgba(255,255,255,.3)' }} onClick={onLogout}>
            🚪 Logout
          </button>
        </>}
      </div>
    </div>
  );
}
