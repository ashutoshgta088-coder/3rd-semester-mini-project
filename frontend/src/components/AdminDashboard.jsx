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

export default function AdminDashboard({ user }) {
  const [tab, setTab]           = useState('analytics');
  const [stats, setStats]       = useState({});
  const [defaulters, setDefaulters] = useState([]);
  const [auditLogs, setAuditLogs]   = useState([]);

  useEffect(() => {
    apiService.adminStats().then(r => { if (r.ok) setStats(r.data || {}); });
    apiService.defaulters().then(r => { if (r.ok) setDefaulters(r.data.defaulters || r.data || []); });
    apiService.auditLogs().then(r => { if (r.ok) setAuditLogs(r.data.logs || r.data || []); });
  }, []);

  const tabs = [
    { id:'analytics', label:'📊 Analytics' },
    { id:'defaulters', label:'⚠️ Defaulters' },
    { id:'audit', label:'🔍 Audit Logs' },
  ];

  return (
    <div className="container fade-in">
      <div className="card card-grad" style={{ marginBottom:20 }}>
        <h2 style={{ fontWeight:900, fontSize:'1.4rem' }}>🛡️ Admin — {user.fullName || user.name || 'Administrator'}</h2>
        <p style={{ opacity:.85, fontSize:'.9rem' }}>System Administration Panel</p>
      </div>

      <div className="tabs">
        {tabs.map(t => <button key={t.id} className={`tab ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      {tab === 'analytics' && (
        <div>
          <div className="g4" style={{ marginBottom:20 }}>
            <StatCard num={stats.totalStudents || 0}  label="Students"       color="var(--primary)" />
            <StatCard num={stats.totalTeachers || 0}  label="Teachers"       color="var(--success)" />
            <StatCard num={stats.totalSessions || 0}  label="Sessions"       color="var(--warn)" />
            <StatCard num={`${stats.avgAttendance || 0}%`} label="Avg Attendance" color={stats.avgAttendance >= 75 ? 'var(--success)' : 'var(--danger)'} />
          </div>
          <div className="card">
            <h4 style={{ fontWeight:700, marginBottom:8 }}>System Info</h4>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><span className="lbl">Mode</span><span className="badge badge-warn">OFFLINE DEMO</span></div>
              <div><span className="lbl">Server</span><span className="badge badge-success">Online</span></div>
              <div><span className="lbl">MongoDB</span><span className="badge badge-danger">Not Connected (In-Memory)</span></div>
              <div><span className="lbl">Socket.IO</span><span className="badge badge-success">Active</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'defaulters' && (
        <div>
          <h3 style={{ fontWeight:800, marginBottom:16 }}>⚠️ Defaulters (Below 75%)</h3>
          {defaulters.length === 0 ? (
            <div className="card" style={{ textAlign:'center', color:'var(--muted)' }}>No defaulters — or data not available in demo mode.</div>
          ) : (
            <div className="card" style={{ overflowX:'auto' }}>
              <table>
                <thead><tr><th>#</th><th>Name</th><th>Roll No.</th><th>Attendance %</th><th>Present</th><th>Total</th></tr></thead>
                <tbody>
                  {defaulters.map((d, i) => (
                    <tr key={i}>
                      <td>{i+1}</td>
                      <td>{d.name || '—'}</td>
                      <td><code>{d.rollNo || '—'}</code></td>
                      <td><span className="badge badge-danger">{d.percentage || 0}%</span></td>
                      <td>{d.present || 0}</td>
                      <td>{d.total || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'audit' && (
        <div>
          <h3 style={{ fontWeight:800, marginBottom:16 }}>🔍 Security Audit Logs</h3>
          {auditLogs.length === 0 ? (
            <div className="card" style={{ textAlign:'center', color:'var(--muted)' }}>No audit logs available.</div>
          ) : (
            <div className="card" style={{ overflowX:'auto' }}>
              <table>
                <thead><tr><th>Time</th><th>Action</th><th>User</th><th>Details</th></tr></thead>
                <tbody>
                  {auditLogs.map((l, i) => (
                    <tr key={i}>
                      <td style={{ fontSize:'.8rem', color:'var(--muted)' }}>{l.createdAt ? new Date(l.createdAt).toLocaleString() : '—'}</td>
                      <td><span className="badge badge-primary">{l.action || '—'}</span></td>
                      <td>{l.userId || '—'}</td>
                      <td style={{ fontSize:'.8rem', color:'var(--muted)' }}>{l.details || '—'}</td>
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
