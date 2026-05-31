import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    student_id: user?.student_id || '',
    current_password: '',
    new_password: '',
  });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null); setLoading(true);
    try {
      await axios.put('/api/users/profile', form);
      setMsg({ type: 'success', text: 'Profile updated successfully.' });
      setForm(f => ({ ...f, current_password: '', new_password: '' }));
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="form-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.8rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--teal)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700 }}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="form-title" style={{ marginBottom: 0 }}>{user?.full_name}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email} · <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></p>
            </div>
          </div>

          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          <form onSubmit={handleSubmit}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Personal Information
            </h3>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input className="form-control" placeholder="e.g. ZUT/2023/001" value={form.student_id} onChange={e => set('student_id', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" placeholder="+260 97 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>

            <h3 style={{ fontWeight: 700, margin: '1.5rem 0 1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Change Password
            </h3>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-control" type="password" value={form.current_password} onChange={e => set('current_password', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-control" type="password" placeholder="Leave blank to keep current" value={form.new_password} onChange={e => set('new_password', e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : <>Save Changes <Icon name="check" size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
