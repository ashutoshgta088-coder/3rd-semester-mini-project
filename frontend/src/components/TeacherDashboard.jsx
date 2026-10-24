import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../api.js';

function StatCard({ num, label, color }) {
  return (
    <div className="stat-card">
      <div className="stat-num" style={{ color }}>{num}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ─── Create Session Tab ─────────────────────────────────────────────────────
function CreateSessionTab({ onCreated }) {
  const [form, setForm] = useState({ subject: '', className: '', date: new Date().toISOString().slice(0,10), duration: 60 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true); setMsg('');
    const res = await apiService.createSession(form);
    setLoading(false);
    if (res.ok) { setMsg('✅ Session created! Starting BLE broadcast...'); onCreated && onCreated(res.data.session || res.data); }
    else setMsg('❌ ' + (res.data.message || 'Failed to create session.'));
  };

  return (
    <div>
      <h3 style={{ fontWeight:800, marginBottom:16 }}>📡 Create Attendance Session</h3>
      <div className="card">
        <form onSubmit={handleCreate}>
          <div className="g2">
            <div className="fg"><label className="lbl">Subject</label><input className="inp" value={form.subject} onChange={e=>set('subject',e.target.value)} placeholder="Data Structures" required /></div>
            <div className="fg"><label className="lbl">Class / Section</label><input className="inp" value={form.className} onChange={e=>set('className',e.target.value)} placeholder="CS-3A" required /></div>
          </div>
          <div className="g2">
            <div className="fg"><label className="lbl">Date</label><input className="inp" type="date" value={form.date} onChange={e=>set('date',e.target.value)} required /></div>
            <div className="fg"><label className="lbl">Duration (minutes)</label><input className="inp" type="number" min="5" max="180" value={form.duration} onChange={e=>set('duration',e.target.value)} required /></div>
          </div>
          {msg && <div style={{ padding:'8px 12px', borderRadius:8, marginBottom:12, color: msg.startsWith('✅') ? 'var(--success)' : 'var(--danger)', background: msg.startsWith('✅') ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)' }}>{msg}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? '⏳ Creating...' : '📡 Start Session'}</button>
        </form>
      </div>
      <div className="card" style={{ background:'var(--grad-card)', borderColor:'var(--border)' }}>
        <h4 style={{ fontWeight:700, marginBottom:8 }}>📱 Android BLE Broadcasting</h4>
        <p style={{ color:'var(--muted)', fontSize:'.85rem', lineHeight:1.6 }}>
          After creating a session, open the <strong>Stuatten Teacher App</strong> on your Android phone to start Bluetooth broadcasting. 
          The app will advertise the session token so nearby student phones can detect it automatically.
        </p>
        <p style={{ color:'var(--warn)', fontSize:'.8rem', marginTop:8 }}>
          ⚠️ Browsers cannot broadcast BLE — the native Android app in <code>android/</code> is required for real BLE.
        </p>
      </div>
    </div>
  );
}

// ─── Live Roster Tab ─────────────────────────────────────────────────────────
function LiveRosterTab({ socket }) {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [roster, setRoster]     = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    apiService.teacherSessions().then(r => { if (r.ok) setSessions(r.data.sessions || r.data || []); });
  }, []);

  useEffect(() => {
    if (!socket || !selected) return;
    const handler = (data) => {
      setRoster(prev => {
        const exists = prev.find(r => r.studentId === data.studentId);
        if (exists) return prev.map(r => r.studentId === data.studentId ? { ...r, ...data } : r);
        return [data, ...prev];
      });
    };
    socket.on('attendance:new', handler);
    return () => socket.off('attendance:new', handler);
  }, [socket, selected]);

  const loadRoster = async (session) => {
    setSelected(session); setLoading(true);
    const r = await apiService.liveRoster(session._id);
    setLoading(false);
    if (r.ok) setRoster(r.data.records || r.data || []);
    if (socket) socket.emit('join:session', { sessionId: session._id });
  };

  const total = roster.length;
  const present = roster.filter(r => r.status === 'PRESENT').length;

  return (
    <div>
      <h3 style={{ fontWeight:800, marginBottom:16 }}>📋 Live Attendance Roster</h3>

      {!selected ? (
        <div>
          <p style={{ color:'var(--muted)', marginBottom:12 }}>Select an active session to view live attendance:</p>
          {sessions.length === 0 ? (
            <div className="card" style={{ textAlign:'center', color:'var(--muted)' }}>No sessions found. Create one first.</div>
          ) : sessions.map(s => (
            <div className="card" key={s._id} style={{ cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }} onClick={() => loadRoster(s)}>
              <div>
                <strong>{s.subject}</strong> — {s.className}
                <div style={{ color:'var(--muted)', fontSize:'.8rem' }}>{s.date?.slice(0,10)} • {s.duration} min</div>
              </div>
              <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-primary'}`}>{s.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <button className="btn btn-outline btn-sm" onClick={() => { setSelected(null); setRoster([]); }}>← Back</button>
            <strong>{selected.subject} — {selected.className}</strong>
            <span className="badge badge-success">LIVE</span>
          </div>

          <div className="g3" style={{ marginBottom:16 }}>
            <StatCard num={total}   label="Submitted" color="var(--primary)" />
            <StatCard num={present} label="Present"   color="var(--success)" />
            <StatCard num={total - present} label="Absent" color="var(--danger)" />
          </div>

          {loading ? <p style={{color:'var(--muted)'}}>Loading roster...</p> : (
            <div className="card" style={{ overflowX:'auto' }}>
              <table>
                <thead><tr><th>#</th><th>Name</th><th>Roll No.</th><th>Time</th><th>Status</th><th>BLE ✓</th></tr></thead>
                <tbody>
                  {roster.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--muted)', padding:24 }}>No attendance records yet. Waiting for students...</td></tr>
                  ) : roster.map((r, i) => (
                    <tr key={r._id || i}>
                      <td>{i+1}</td>
                      <td>{r.studentName || r.name || '—'}</td>
                      <td><code>{r.rollNo || r.studentId || '—'}</code></td>
                      <td style={{ color:'var(--muted)', fontSize:'.8rem' }}>{r.markedAt ? new Date(r.markedAt).toLocaleTimeString() : '—'}</td>
                      <td><span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span></td>
                      <td>{r.bleVerified ? '✅' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Past Sessions Tab ────────────────────────────────────────────────────────
function PastSessionsTab() {
  const [sessions, setSessions] = useState([]);
  useEffect(() => {
    apiService.teacherSessions().then(r => { if (r.ok) setSessions(r.data.sessions || r.data || []); });
  }, []);

  return (
    <div>
      <h3 style={{ fontWeight:800, marginBottom:16 }}>📂 Past Sessions</h3>
      {sessions.length === 0 ? (
        <div className="card" style={{ textAlign:'center', color:'var(--muted)' }}>No past sessions yet.</div>
      ) : sessions.map(s => (
        <div className="card" key={s._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <strong>{s.subject}</strong> — {s.className}
            <div style={{ color:'var(--muted)', fontSize:'.8rem' }}>{s.date?.slice(0,10)} • {s.duration} min</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : s.status === 'CLOSED' ? 'badge-primary' : 'badge-warn'}`}>{s.status}</span>
            {s.status === 'CLOSED' && (
              <a href={apiService.exportSession(s._id)} className="btn btn-outline btn-sm" download>📥 Export</a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────
function ReportsTab() {
  const [sessions, setSessions] = useState([]);
  const [sel, setSel] = useState(null);
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    apiService.teacherSessions().then(r => { if (r.ok) setSessions(r.data.sessions || r.data || []); });
  }, []);

  const loadReport = async (s) => {
    setSel(s);
    const r = await apiService.liveRoster(s._id);
    if (r.ok) setRoster(r.data.records || r.data || []);
  };

  const exportCSV = () => {
    if (!roster.length) return;
    const bom = '\uFEFF';
    const header = 'S.No.,Name,Roll No.,Status,Time\n';
    const rows = roster.map((r,i) => `${i+1},${r.studentName||''},${r.rollNo||r.studentId||''},${r.status},${r.markedAt ? new Date(r.markedAt).toLocaleString() : ''}`).join('\n');
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `attendance_${sel.subject}_${sel.date?.slice(0,10)}.csv`; a.click();
  };

  return (
    <div>
      <h3 style={{ fontWeight:800, marginBottom:16 }}>📊 Reports & Export</h3>
      <div className="g2" style={{ alignItems:'start' }}>
        <div>
          <p style={{ color:'var(--muted)', fontSize:'.85rem', marginBottom:8 }}>Select a session to generate report:</p>
          {sessions.map(s => (
            <div className="card" key={s._id} style={{ cursor:'pointer', padding:'12px 16px', marginBottom:8, border: sel?._id === s._id ? '2px solid var(--primary)' : '1px solid var(--border)' }} onClick={() => loadReport(s)}>
              <strong style={{ fontSize:'.9rem' }}>{s.subject}</strong> — {s.className}
              <div style={{ color:'var(--muted)', fontSize:'.75rem' }}>{s.date?.slice(0,10)}</div>
            </div>
          ))}
        </div>
        {sel && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <strong>{sel.subject} Report</strong>
              <button className="btn btn-success btn-sm" onClick={exportCSV}>📥 Export CSV</button>
            </div>
            <div className="card" style={{ overflowX:'auto' }}>
              <table>
                <thead><tr><th>#</th><th>Name</th><th>Roll No.</th><th>Status</th><th>Time</th></tr></thead>
                <tbody>
                  {roster.map((r,i) => (
                    <tr key={i}>
                      <td>{i+1}</td>
                      <td>{r.studentName || '—'}</td>
                      <td><code>{r.rollNo || r.studentId || '—'}</code></td>
                      <td><span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span></td>
                      <td style={{ color:'var(--muted)', fontSize:'.8rem' }}>{r.markedAt ? new Date(r.markedAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
export default function TeacherDashboard({ user, socket }) {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, pct: 0 });

  useEffect(() => {
    apiService.teacherSessions().then(r => {
      if (r.ok) {
        const sessions = r.data.sessions || r.data || [];
        const total = sessions.length;
        const active = sessions.filter(s => s.status === 'ACTIVE').length;
        setStats({ total, active, closed: total - active });
      }
    });
  }, []);

  const tabs = [
    { id:'dashboard',    label:'📊 Dashboard' },
    { id:'create',       label:'📡 Create Session' },
    { id:'live',         label:'📋 Live Roster' },
    { id:'past',         label:'📂 Past Sessions' },
    { id:'reports',      label:'📈 Reports' },
  ];

  return (
    <div className="container fade-in">
      <div className="card card-grad" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontWeight:900, fontSize:'1.4rem' }}>👨‍🏫 {user.fullName || user.name}</h2>
            <p style={{ opacity:.85, fontSize:'.9rem' }}>Teacher Dashboard • {user.id || user.teacherId || 'T-???'}</p>
          </div>
          <div style={{ textAlign:'center' }}>
            <div className="ble-dot ble-off" style={{ display:'inline-block' }} />
            <span style={{ fontSize:'.8rem', opacity:.8 }}>BLE via Android App</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t => <button key={t.id} className={`tab ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      {tab === 'dashboard' && (
        <div>
          <div className="g3" style={{ marginBottom:20 }}>
            <StatCard num={stats.total || 0}   label="Total Sessions" color="var(--primary)" />
            <StatCard num={stats.active || 0}  label="Active Now"     color="var(--success)" />
            <StatCard num={stats.closed || 0}  label="Closed"         color="var(--muted)" />
          </div>
          <div className="card">
            <h4 style={{ fontWeight:700, marginBottom:8 }}>🚀 Quick Actions</h4>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button className="btn btn-primary" onClick={() => setTab('create')}>📡 Start New Session</button>
              <button className="btn btn-outline" onClick={() => setTab('live')}>📋 View Live Roster</button>
              <button className="btn btn-outline" onClick={() => setTab('reports')}>📊 Generate Report</button>
            </div>
          </div>
          <div className="card">
            <h4 style={{ fontWeight:700, marginBottom:8 }}>ℹ️ About Stuatten</h4>
            <p style={{ color:'var(--muted)', fontSize:'.85rem', lineHeight:1.6 }}>
              Stuatten uses Bluetooth Low Energy (BLE) beacons to allow students to discover active sessions. 
              The teacher's Android app broadcasts a session token; students scan and submit attendance through the backend. 
              All records are validated server-side before being marked as present.
            </p>
          </div>
        </div>
      )}
      {tab === 'create'    && <CreateSessionTab onCreated={() => setTab('live')} />}
      {tab === 'live'      && <LiveRosterTab socket={socket} />}
      {tab === 'past'      && <PastSessionsTab />}
      {tab === 'reports'   && <ReportsTab />}
    </div>
  );
}
