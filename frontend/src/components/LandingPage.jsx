import React from 'react';

export default function LandingPage({ user, onNavigate, onLogout }) {
  const features = [
    { icon: '📡', title: 'Bluetooth Detection', desc: 'Students detect the classroom beacon automatically via BLE. No QR codes, no manual entry.' },
    { icon: '🔒', title: 'Biometric Verification', desc: 'WebAuthn passkeys and fingerprint authentication on supported devices.' },
    { icon: '📍', title: 'Location Check', desc: 'Optional GPS verification ensures students are physically in the classroom.' },
    { icon: '⚡', title: 'Real-time Sync', desc: 'Teacher dashboard updates instantly as students mark attendance via Socket.IO.' },
    { icon: '📊', title: 'Excel Reports', desc: 'Export attendance records as Excel/CSV for AKTU compliance.' },
    { icon: '🛡️', title: 'Anti-Proxy', desc: 'Short-lived tokens, server-side validation and duplicate prevention.' },
  ];

  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{ background: 'var(--grad)', color: '#fff', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎓</div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, letterSpacing: -1, marginBottom: 12 }}>
          Stuatten
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: .85, maxWidth: 560, margin: '0 auto 24px' }}>
          Bluetooth-Based Smart Attendance System for AKTU colleges.<br />
          Start a session, students walk in, attendance is done.
        </p>

        {user ? (
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '16px 24px', borderRadius: 16, display: 'inline-block', maxWidth: 480, margin: '0 auto' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>
              👋 Logged in as <strong>{user.fullName || user.name}</strong> ({user.role})
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 800, padding: '12px 28px', fontSize: '1rem' }} onClick={() => onNavigate('DASHBOARD')}>
                📊 Open Dashboard ({user.role})
              </button>
              <button className="btn" style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', padding: '12px 20px', fontSize: '0.95rem' }} onClick={onLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 800, padding: '12px 28px', fontSize: '1rem' }} onClick={() => onNavigate('LOGIN')}>
              🔑 Login
            </button>
            <button className="btn" style={{ background: 'rgba(255,255,255,.2)', color: '#fff', border: '2px solid rgba(255,255,255,.5)', padding: '12px 28px', fontSize: '1rem' }} onClick={() => onNavigate('REGISTER')}>
              📝 Register
            </button>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="container" style={{ paddingTop: 48 }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.6rem', marginBottom: 8 }}>How It Works</h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 32 }}>Smart, secure, and fully automated attendance</p>
        <div className="g3">
          {features.map((f, i) => (
            <div className="card" key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '.85rem', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How to use */}
        <div className="card card-grad" style={{ marginTop: 32, textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800, marginBottom: 20, fontSize: '1.4rem' }}>Quick Start</h2>
          <div className="g4" style={{ gap: 20, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
            {[
              { s:'1', t:'Teacher logs in', d:'Opens dashboard, creates attendance session' },
              { s:'2', t:'BLE Beacon starts', d:'Android app broadcasts the session token via Bluetooth' },
              { s:'3', t:'Students detect it', d:'Android app scans, shows active session' },
              { s:'4', t:'Mark & sync', d:'Student verifies identity, backend records attendance' },
            ].map(({ s, t, d }) => (
              <div key={s} style={{ textAlign: 'center' }}>
                <div className="step-circle step-active" style={{ margin: '0 auto 10px', width:40, height:40, fontSize:'1.1rem' }}>{s}</div>
                <strong style={{ display:'block', marginBottom:4 }}>{t}</strong>
                <span style={{ fontSize:'.8rem', opacity:.8 }}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login CTA */}
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Ready to get started?</p>
          {user ? (
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button className="btn btn-primary" style={{ padding:'12px 28px' }} onClick={() => onNavigate('DASHBOARD')}>📊 Go to Dashboard</button>
            </div>
          ) : (
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button className="btn btn-primary" style={{ padding:'12px 28px' }} onClick={() => onNavigate('LOGIN')}>🔑 Sign In</button>
              <button className="btn btn-outline"  style={{ padding:'12px 28px' }} onClick={() => onNavigate('REGISTER')}>📝 Register</button>
            </div>
          )}
          <p style={{ marginTop: 16, color: 'var(--muted)', fontSize:'.8rem' }}>
            Demo: Student <code>2501530100032</code> (Ashutosh) or <code>2100270100001</code> / Teacher <code>T1001</code>
          </p>
        </div>
      </div>
    </div>
  );
}
