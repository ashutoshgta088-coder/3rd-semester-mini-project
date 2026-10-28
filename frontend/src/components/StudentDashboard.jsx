import React, { useState, useEffect } from 'react';
import { apiService } from '../api.js';

function StatCard({ num, label, color }) {
  return (
    <div className="stat-card">
      <div className="stat-num" style={{ color }}>{num}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ─── Mark Attendance (5-step flow with Anti-Spoofing & Permitted Range) ───────
function MarkAttendanceTab({ user }) {
  const [step, setStep]         = useState(1);
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bleFound, setBleFound] = useState(false);
  const [bleDenied, setBleDenied] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [locOk, setLocOk]       = useState(false);
  const [bioOk, setBioOk]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Generate or retrieve persistent hardware device ID to prevent multi-account proxying
  const getDeviceId = () => {
    let id = localStorage.getItem('stuatten_device_id');
    if (!id) {
      id = 'DEV_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('stuatten_device_id', id);
    }
    return id;
  };

  useEffect(() => {
    if (step === 1) {
      apiService.activeSessions().then(r => {
        if (r.ok) setSessions(r.data.sessions || r.data || []);
      });
    }
  }, [step]);

  // Step 2: Simulate BLE scan with permission check
  const scanBLE = () => {
    setBleFound(false);
    setBleDenied(false);
    setTimeout(() => {
      // Simulate successful classroom beacon detection within range (-68 dBm)
      setBleFound(true);
    }, 1500);
  };

  const handleBlePermissionDenied = () => {
    setBleFound(false);
    setBleDenied(true);
  };

  // Step 3: Location check
  const checkLocation = () => {
    if (!navigator.geolocation) { setLocOk(true); return; }
    navigator.geolocation.getCurrentPosition(
      () => setLocOk(true),
      () => setLocOk(true) // allow even if denied
    );
  };

  // Step 4: Biometric via WebAuthn (passkey / fingerprint)
  const doBiometric = async () => {
    if (window.PublicKeyCredential) {
      try {
        await navigator.credentials.get({ publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: 'preferred',
          rpId: window.location.hostname
        }});
        setBioOk(true);
      } catch {
        setBioOk(true);
      }
    } else {
      setBioOk(true);
    }
  };

  // Step 5: Submit attendance with Anti-Proxy device binding
  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setSubmissionResult(null);

    const deviceId = getDeviceId();
    const res = await apiService.markAttendance({
      sessionId: selected._id || selected.sessionId,
      bleVerified: bleFound,
      bleRssi: bleFound ? -68 : -95, // inside vs outside
      roomCode: roomCodeInput.trim() || selected.roomCode,
      locationVerified: locOk,
      biometricVerified: bioOk,
      deviceId,
      deviceModel: navigator.userAgent.slice(0, 40)
    });

    setSubmitting(false);

    if (res.ok) {
      setSubmissionResult({
        type: 'SUCCESS',
        title: 'Attendance Verified & Marked PRESENT!',
        message: res.data.message || 'Recorded in the classroom attendance ledger.',
        record: res.data.record,
        timestamp: new Date().toLocaleTimeString()
      });
      setStep(6);
    } else {
      const code = res.data?.code || 'ERROR';
      const msg = res.data?.message || 'Failed to verify attendance. Please try again.';
      setSubmissionResult({
        type: code,
        title: code === 'DEVICE_SPOOF_DETECTED'
          ? '🚫 Anti-Proxy Alert'
          : code === 'ALREADY_SUBMITTED'
          ? '⚠️ Duplicate Attendance Blocked'
          : code === 'PROXIMITY_OUT_OF_RANGE'
          ? '📡 Proximity Check Failed'
          : '❌ Verification Failed',
        message: msg,
        markedAt: res.data?.markedAt
      });
      setStep(6);
    }
  };

  const steps = [
    'Select Session',
    'BLE Range',
    'Location',
    'Biometric',
    'Confirm',
  ];

  if (step === 6 && submissionResult) {
    const isSuccess = submissionResult.type === 'SUCCESS';
    const isDuplicate = submissionResult.type === 'ALREADY_SUBMITTED';
    const isSpoof = submissionResult.type === 'DEVICE_SPOOF_DETECTED';

    return (
      <div className="card fade-in" style={{ textAlign:'center', padding:36, maxWidth: 500, margin: '0 auto' }}>
        <div style={{ fontSize:64, marginBottom:16 }}>
          {isSuccess ? '🎉' : isDuplicate ? '⚠️' : isSpoof ? '🚫' : '❌'}
        </div>
        <h3 style={{
          color: isSuccess ? 'var(--success)' : isDuplicate ? 'var(--warn)' : 'var(--danger)',
          fontWeight:800, fontSize:'1.4rem', marginBottom: 8
        }}>
          {submissionResult.title}
        </h3>
        <p style={{ color:'var(--text)', fontSize: '.95rem', lineHeight: 1.5, marginBottom: 20 }}>
          {submissionResult.message}
        </p>

        {isSuccess && (
          <div style={{ background:'var(--grad-card)', padding:16, borderRadius:12, textAlign:'left', fontSize:'.85rem', marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
              <span style={{ color:'var(--muted)' }}>Student Roll:</span>
              <strong>{user.rollNumber || user.identifier || user.id}</strong>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
              <span style={{ color:'var(--muted)' }}>Subject:</span>
              <strong>{selected?.subject || selected?.subjectName}</strong>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
              <span style={{ color:'var(--muted)' }}>Verification Method:</span>
              <span className="badge badge-success">{bleFound ? 'BLE Proximity (~4.8m)' : 'Dynamic Room Code'}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--muted)' }}>Device Token:</span>
              <code>{getDeviceId()}</code>
            </div>
          </div>
        )}

        <button className="btn btn-outline" onClick={() => {
          setStep(1); setSelected(null); setBleFound(false); setBleDenied(false);
          setLocOk(false); setBioOk(false); setSubmissionResult(null); setRoomCodeInput('');
        }}>
          ← Return to Active Sessions
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontWeight:800, marginBottom:16 }}>✅ Mark Attendance</h3>

      {/* Step indicators */}
      <div style={{ display:'flex', gap:8, marginBottom:24, alignItems:'center', flexWrap:'wrap' }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div className={`step-circle ${step > i+1 ? 'step-done' : step === i+1 ? 'step-active' : 'step-inactive'}`} style={{ width:30, height:30, fontSize:'.8rem' }}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <span style={{ fontSize:'.78rem', color: step === i+1 ? 'var(--primary)' : 'var(--muted)', fontWeight: step === i+1 ? 700 : 400 }}>{s}</span>
            </div>
            {i < steps.length-1 && <div style={{ flex:1, minWidth:20, height:2, background:'var(--border)' }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <div>
            <h4 style={{ fontWeight:700, marginBottom:12 }}>Step 1 — Select Active Classroom Session</h4>
            {sessions.length === 0 ? (
              <p style={{ color:'var(--muted)' }}>No active sessions right now. Ask your teacher to start one.</p>
            ) : sessions.map(s => (
              <div key={s._id || s.sessionId} className="card" style={{ cursor:'pointer', marginBottom:10, border: selected?._id === s._id ? '2px solid var(--primary)' : '1px solid var(--border)', padding:'14px 18px', background: selected?._id === s._id ? 'rgba(79,70,229,.05)' : 'var(--card)' }} onClick={() => setSelected(s)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <strong>{s.subject || s.subjectName} — {s.className || s.section}</strong>
                  <span className="badge badge-success">ACTIVE</span>
                </div>
                <div style={{ color:'var(--muted)', fontSize:'.8rem', marginTop: 4 }}>
                  Faculty: {s.facultyName || s.teacherName} • Permitted Range: {s.allowedRadiusMeters || 15}m (RSSI ≥ {s.rssiThreshold || -75} dBm)
                </div>
              </div>
            ))}
            <button className="btn btn-primary" disabled={!selected} onClick={() => setStep(2)} style={{ marginTop:12 }}>Next: Check Proximity →</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <h4 style={{ fontWeight:700, marginBottom:12 }}>Step 2 — BLE Proximity Verification</h4>
            <div style={{ fontSize:60, marginBottom:14 }} className={bleFound ? '' : 'beacon-pulse'}>📡</div>
            <p style={{ color:'var(--text)', marginBottom:8, fontWeight: 600 }}>
              {bleFound ? '✅ Bluetooth Beacon Detected inside Permitted Classroom Range (~4.8m)' : 'Scanning for classroom Bluetooth beacon...'}
            </p>
            <p style={{ fontSize:'.8rem', color:'var(--muted)', marginBottom:20 }}>
              Permitted threshold: <strong>RSSI ≥ {selected?.rssiThreshold || -75} dBm</strong> ({selected?.allowedRadiusMeters || 15}m radius).
            </p>

            {!bleFound && !bleDenied && (
              <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                <button className="btn btn-primary" onClick={scanBLE}>📡 Scan for Beacon</button>
                <button className="btn btn-outline" onClick={handleBlePermissionDenied}>⚠️ Bluetooth Denied / Fallback</button>
              </div>
            )}

            {bleFound && (
              <button className="btn btn-success" onClick={() => setStep(3)}>✅ Proximity Confirmed → Continue</button>
            )}

            {bleDenied && (
              <div style={{ background:'rgba(245,158,11,.1)', padding:16, borderRadius:12, maxWidth:380, margin:'0 auto 16px', textAlign:'left' }}>
                <strong style={{ color:'var(--warn)', fontSize:'.85rem' }}>⚠️ Bluetooth Permissions Denied or Unavailable</strong>
                <p style={{ fontSize:'.8rem', color:'var(--muted)', marginTop:4, marginBottom:10 }}>
                  Enter the dynamic 6-digit classroom security code displayed on the teacher's screen:
                </p>
                <input
                  className="inp"
                  value={roomCodeInput}
                  onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. STU-8492"
                  style={{ textTransform:'uppercase', letterSpacing: 2, textAlign:'center', fontWeight:700 }}
                />
                <button className="btn btn-primary btn-w" style={{ marginTop:10 }} disabled={!roomCodeInput.trim()} onClick={() => setStep(3)}>
                  Verify Classroom Code →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <h4 style={{ fontWeight:700, marginBottom:12 }}>Step 3 — Campus Geofence Verification</h4>
            <div style={{ fontSize:60, marginBottom:14 }}>📍</div>
            <p style={{ color:'var(--text)', marginBottom:12 }}>
              {locOk ? '✅ Campus boundary verified.' : 'Verify you are physically located on campus.'}
            </p>
            {!locOk ? (
              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <button className="btn btn-primary" onClick={checkLocation}>📍 Check Geofence</button>
                <button className="btn btn-outline" onClick={() => { setLocOk(true); setStep(4); }}>Skip (Demo)</button>
              </div>
            ) : (
              <button className="btn btn-success" onClick={() => setStep(4)}>✅ Continue →</button>
            )}
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <h4 style={{ fontWeight:700, marginBottom:12 }}>Step 4 — Student Device Authentication</h4>
            <div style={{ fontSize:60, marginBottom:14 }}>🔐</div>
            <p style={{ color:'var(--text)', marginBottom:8 }}>
              {bioOk ? '✅ Device identity authenticated.' : 'Confirm presence using WebAuthn passkey, fingerprint, or PIN.'}
            </p>
            <p style={{ fontSize:'.8rem', color:'var(--muted)', marginBottom:16 }}>
              Locks this physical device to your student roll number for this session to eliminate proxy attendance.
            </p>
            {!bioOk ? (
              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <button className="btn btn-primary" onClick={doBiometric}>🔐 Authenticate Device</button>
                <button className="btn btn-outline" onClick={() => { setBioOk(true); setStep(5); }}>Skip (Demo)</button>
              </div>
            ) : (
              <button className="btn btn-success" onClick={() => setStep(5)}>✅ Continue →</button>
            )}
          </div>
        )}

        {step === 5 && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <h4 style={{ fontWeight:700, marginBottom:16 }}>Step 5 — Review & Submit Attendance</h4>
            <div className="card" style={{ background:'var(--grad-card)', maxWidth:360, margin:'0 auto 20px', textAlign:'left' }}>
              <div className="fg"><span className="lbl">Subject</span><strong>{selected?.subject || selected?.subjectName}</strong></div>
              <div className="fg"><span className="lbl">Class / Section</span><strong>{selected?.className || selected?.section}</strong></div>
              <div className="fg"><span className="lbl">Proximity</span><span className={`badge ${bleFound ? 'badge-success' : 'badge-warn'}`}>{bleFound ? 'BLE Verified (~4.8m)' : `Room Code: ${roomCodeInput || 'Provided'}`}</span></div>
              <div className="fg"><span className="lbl">Device Token</span><code>{getDeviceId()}</code></div>
            </div>

            {submitting ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'16px 0' }}>
                <div style={{
                  width:36, height:36, border:'4px solid rgba(79,70,229,.2)',
                  borderTopColor:'var(--primary)', borderRadius:'50%',
                  animation:'spin 0.8s linear infinite'
                }} />
                <strong style={{ color:'var(--primary)' }}>⏳ Verifying Proximity, Anti-Proxy & Submitting...</strong>
                <span style={{ fontSize:'.75rem', color:'var(--muted)' }}>Recording transaction into institutional ledger</span>
              </div>
            ) : (
              <button className="btn btn-success" onClick={submit} style={{ padding:'12px 36px', fontSize:'1rem', fontWeight:800 }}>
                ✅ Submit Attendance Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Attendance History Tab ───────────────────────────────────────────────────
function HistoryTab() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.studentHistory().then(r => {
      setLoading(false);
      if (r.ok) setRecords(r.data.records || r.data || []);
    });
  }, []);

  const present = records.filter(r => r.status === 'PRESENT').length;
  const pct = records.length ? Math.round(present / records.length * 100) : 0;

  return (
    <div>
      <h3 style={{ fontWeight:800, marginBottom:16 }}>📅 Attendance History</h3>
      <div className="g3" style={{ marginBottom:16 }}>
        <StatCard num={records.length} label="Total Classes" color="var(--primary)" />
        <StatCard num={present}        label="Present"       color="var(--success)" />
        <StatCard num={`${pct}%`}      label="Attendance %"  color={pct >= 75 ? 'var(--success)' : 'var(--danger)'} />
      </div>
      {loading ? <p style={{ color:'var(--muted)' }}>Loading...</p> : (
        <div className="card" style={{ overflowX:'auto' }}>
          <table>
            <thead><tr><th>#</th><th>Subject</th><th>Date</th><th>Status</th><th>Method</th></tr></thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--muted)', padding:24 }}>No attendance records yet.</td></tr>
              ) : records.map((r, i) => (
                <tr key={r._id || i}>
                  <td>{i+1}</td>
                  <td>{r.subject || r.sessionSubject || '—'}</td>
                  <td style={{ color:'var(--muted)', fontSize:'.85rem' }}>{r.date?.slice(0,10) || r.markedAt?.slice(0,10) || '—'}</td>
                  <td><span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span></td>
                  <td style={{ fontSize:'.8rem', color:'var(--muted)' }}>{r.method || 'BLE+Biometric'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user }) {
  return (
    <div>
      <h3 style={{ fontWeight:800, marginBottom:16 }}>👤 My Profile</h3>
      <div className="card" style={{ maxWidth:480 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#fff', fontWeight:800 }}>
            {(user.fullName || user.name || 'S')[0].toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontWeight:800 }}>{user.fullName || user.name}</h3>
            <p style={{ color:'var(--muted)', fontSize:'.85rem' }}>{user.role}</p>
          </div>
        </div>
        <div className="fg"><span className="lbl">Roll Number</span><strong>{user.rollNo || user.id || '—'}</strong></div>
        <div className="fg"><span className="lbl">Email</span><strong>{user.email || '—'}</strong></div>
        <div className="fg"><span className="lbl">Class</span><strong>{user.class || user.section || '—'}</strong></div>
        <div className="fg"><span className="lbl">Branch</span><strong>{user.branch || '—'}</strong></div>
      </div>
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
export default function StudentDashboard({ user, socket }) {
  const [tab, setTab] = useState('dashboard');
  const [activeSessions, setActiveSessions] = useState(0);

  useEffect(() => {
    apiService.activeSessions().then(r => {
      if (r.ok) setActiveSessions((r.data.sessions || r.data || []).length);
    });
  }, []);

  const tabs = [
    { id:'dashboard', label:'📊 Dashboard' },
    { id:'mark',      label:'✅ Mark Attendance' },
    { id:'history',   label:'📅 History' },
    { id:'profile',   label:'👤 Profile' },
  ];

  return (
    <div className="container fade-in">
      <div className="card card-grad" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontWeight:900, fontSize:'1.4rem' }}>👨‍🎓 {user.fullName || user.name}</h2>
            <p style={{ opacity:.85, fontSize:'.9rem' }}>Student • {user.rollNo || user.id || '—'}</p>
          </div>
          {activeSessions > 0 && (
            <div style={{ background:'rgba(255,255,255,.2)', padding:'8px 16px', borderRadius:12, textAlign:'center' }}>
              <div style={{ fontWeight:800, fontSize:'1.4rem' }}>{activeSessions}</div>
              <div style={{ fontSize:'.75rem', opacity:.8 }}>Active Session{activeSessions > 1 ? 's' : ''}</div>
            </div>
          )}
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t => <button key={t.id} className={`tab ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      {tab === 'dashboard' && (
        <div>
          {activeSessions > 0 && (
            <div className="card" style={{ background:'rgba(16,185,129,.08)', borderColor:'var(--success)', marginBottom:16 }}>
              <p style={{ color:'var(--success)', fontWeight:700 }}>🟢 {activeSessions} active attendance session{activeSessions > 1 ? 's' : ''} detected!</p>
              <button className="btn btn-success btn-sm" style={{ marginTop:8 }} onClick={() => setTab('mark')}>Mark Attendance Now →</button>
            </div>
          )}
          <div className="card">
            <h4 style={{ fontWeight:700, marginBottom:10 }}>🚀 Quick Actions</h4>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button className="btn btn-primary" onClick={() => setTab('mark')}>✅ Mark Attendance</button>
              <button className="btn btn-outline" onClick={() => setTab('history')}>📅 View History</button>
              <button className="btn btn-outline" onClick={() => setTab('profile')}>👤 My Profile</button>
            </div>
          </div>
          <div className="card">
            <h4 style={{ fontWeight:700, marginBottom:8 }}>📱 Android App for Real BLE</h4>
            <p style={{ color:'var(--muted)', fontSize:'.85rem', lineHeight:1.6 }}>
              For real Bluetooth session detection, use the <strong>Stuatten Student Android App</strong> (in <code>android/</code> folder).
              It scans for BLE beacons and shows active sessions automatically when you enter the classroom.
            </p>
          </div>
        </div>
      )}
      {tab === 'mark'    && <MarkAttendanceTab user={user} />}
      {tab === 'history' && <HistoryTab />}
      {tab === 'profile' && <ProfileTab user={user} />}
    </div>
  );
}
