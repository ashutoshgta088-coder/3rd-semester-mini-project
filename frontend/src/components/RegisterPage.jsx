import React, { useState } from 'react';
import { apiService } from '../api.js';

export default function RegisterPage({ onNavigate }) {
  const [role, setRole] = useState('STUDENT');
  const [form, setForm] = useState({ fullName: '', id: '', email: '', password: '', confirm: '', class: '', branch: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    if (form.password !== form.confirm) { setErr('Passwords do not match.'); return; }
    setLoading(true);
    const res = await apiService.register({
      ...form,
      identifier: form.id,
      rollNumber: form.id,
      facultyId: form.id,
      role
    });
    setLoading(false);
    if (res.ok) {
      setMsg('✅ Registered successfully! You can now log in.');
      setForm({ fullName: '', id: '', email: '', password: '', confirm: '', class: '', branch: '' });
    } else {
      setErr(res.data.message || 'Registration failed.');
    }
  };

  return (
    <div className="container fade-in" style={{ maxWidth: 480, paddingTop: 40 }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>📝</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary)' }}>Create Account</h2>
          <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Register as a student or teacher</p>
        </div>

        <div className="g2" style={{ marginBottom: 20 }}>
          {['STUDENT','TEACHER'].map(r => (
            <button key={r} className={`btn ${role === r ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '.8rem' }} onClick={() => setRole(r)}>
              {r === 'STUDENT' ? '👨‍🎓 Student' : '👨‍🏫 Teacher'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label className="lbl">Full Name</label>
            <input className="inp" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your full name" required />
          </div>
          <div className="fg">
            <label className="lbl">{role === 'STUDENT' ? 'AKTU Roll Number' : 'Teacher ID'}</label>
            <input className="inp" value={form.id} onChange={e => set('id', e.target.value)} placeholder={role === 'STUDENT' ? '2100270100001' : 'T1001'} required />
          </div>
          <div className="fg">
            <label className="lbl">Email</label>
            <input className="inp" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@liet.ac.in" />
          </div>
          {role === 'STUDENT' && <>
            <div className="g2">
              <div className="fg">
                <label className="lbl">Class / Section</label>
                <input className="inp" value={form.class} onChange={e => set('class', e.target.value)} placeholder="CS-3A" />
              </div>
              <div className="fg">
                <label className="lbl">Branch</label>
                <input className="inp" value={form.branch} onChange={e => set('branch', e.target.value)} placeholder="CSE" />
              </div>
            </div>
          </>}
          <div className="fg">
            <label className="lbl">Password</label>
            <input className="inp" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" required />
          </div>
          <div className="fg">
            <label className="lbl">Confirm Password</label>
            <input className="inp" type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat password" required />
          </div>

          {err && <div style={{ color: 'var(--danger)', fontSize: '.85rem', marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,.08)', borderRadius: 8 }}>⚠️ {err}</div>}
          {msg && <div style={{ color: 'var(--success)', fontSize: '.85rem', marginBottom: 12, padding: '8px 12px', background: 'rgba(16,185,129,.08)', borderRadius: 8 }}>{msg}</div>}

          <button className="btn btn-primary btn-w" type="submit" disabled={loading}>
            {loading ? '⏳ Registering...' : '📝 Create Account'}
          </button>
        </form>

        <hr className="divider" />
        <button className="btn btn-outline btn-w btn-sm" onClick={() => onNavigate('LOGIN')}>
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
}
