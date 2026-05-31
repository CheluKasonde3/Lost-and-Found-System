import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get('/api/users/stats'),
      axios.get('/api/items?limit=50'),
      axios.get('/api/users'),
      axios.get('/api/claims?status=pending'),
    ]).then(([s, it, us, claims]) => {
      setStats(s.data);
      setItems(it.data.items);
      setUsers(us.data);
      setPendingClaims(claims.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleClaimAction = async (claimId, status) => {
    try {
      const { data } = await axios.put(`/api/claims/${claimId}`, { status });
      alert(`Claim ${status} successfully.`);
      setPendingClaims(p => p.filter(c => c.id !== claimId));
      setStats(current => current ? {
        ...current,
        claims: {
          ...current.claims,
          pending: Math.max(0, Number(current.claims.pending || 0) - 1),
          [status]: Number(current.claims[status] || 0) + 1,
        },
      } : current);
      if (status === 'approved') {
        setItems(list => list.map(item => (
          item.id === data.item_id ? { ...item, status: 'claimed' } : item
        )));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed.');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await axios.put(`/api/users/${userId}/role`, { role });
      setUsers(us => us.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) {
      alert(err.response?.data?.error || 'Role update failed.');
    }
  };

  const loadPendingClaims = async () => {
    setClaimsLoading(true);
    setClaimsError('');
    try {
      const res = await axios.get('/api/claims?status=pending');
      setPendingClaims(res.data);
      if (res.data.length === 0) setClaimsError('No pending claims to review.');
    } catch (err) {
      setClaimsError(err.response?.data?.error || 'Failed to load claims.');
    } finally {
      setClaimsLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const tabs = ['overview', 'claims', 'items', 'users'];

  const renderPendingClaims = () => (
    <div className="table-card">
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        Pending Claims to Review
        <button className="btn btn-outline btn-sm" type="button" onClick={loadPendingClaims}>Refresh</button>
      </h2>
      {claimsLoading ? (
        <div style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>Loading claims...</div>
      ) : claimsError ? (
        <div style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>{claimsError}</div>
      ) : pendingClaims.length === 0 ? (
        <div style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>No pending claims to review.</div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Item</th><th>Claimant</th><th>Student ID</th><th>Description</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {pendingClaims.map(c => (
              <tr key={c.id}>
                <td>
                  <strong>{c.item_title}</strong><br />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.item_location || 'N/A'} - {c.item_status}</span>
                </td>
                <td><strong>{c.full_name}</strong><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.email}</span></td>
                <td>{c.student_id || 'N/A'}</td>
                <td style={{ maxWidth: 280 }}>{c.description}</td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleDateString('en-ZM')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link to={`/items/${c.item_id}`} className="btn btn-outline btn-sm">View</Link>
                    <button className="btn btn-primary btn-sm" onClick={() => handleClaimAction(c.id, 'approved')}><Icon name="check" size={14} /> Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleClaimAction(c.id, 'rejected')}><Icon name="x" size={14} /> Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Manage items, users, and claims for the ZUT Lost &amp; Found System.</p>
        </div>
      </div>
      <div className="container">
        <div className="tabs">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`tab-button ${activeTab === t ? 'active' : ''}`}>
              {t}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card red">
                <div className="stat-num">{stats.items.lost}</div>
                <div className="stat-label">Lost Items</div>
                <Icon name="help" />
              </div>
              <div className="stat-card green">
                <div className="stat-num">{stats.items.found}</div>
                <div className="stat-label">Found Items</div>
                <Icon name="package" />
              </div>
              <div className="stat-card amber">
                <div className="stat-num">{stats.items.claimed}</div>
                <div className="stat-label">Claimed</div>
                <Icon name="check" />
              </div>
              <div className="stat-card">
                <div className="stat-num">{stats.items.total}</div>
                <div className="stat-label">Total Items</div>
                <Icon name="clipboard" />
              </div>
              <div className="stat-card">
                <div className="stat-num">{stats.users.total}</div>
                <div className="stat-label">Registered Users</div>
                <Icon name="users" />
              </div>
              <div className="stat-card amber">
                <div className="stat-num">{stats.claims.pending}</div>
                <div className="stat-label">Pending Claims</div>
                <Icon name="file" />
              </div>
            </div>

            {renderPendingClaims()}
          </>
        )}

        {/* CLAIMS TAB */}
        {activeTab === 'claims' && renderPendingClaims()}

        {/* ITEMS TAB */}
        {activeTab === 'items' && (
          <div className="table-card">
            <h2>All Items ({items.length})</h2>
            <table className="data-table">
              <thead><tr><th>#</th><th>Title</th><th>Status</th><th>Category</th><th>Reported By</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{item.id}</td>
                    <td style={{ fontWeight: 600 }}>{item.title}</td>
                    <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                    <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                    <td>{item.reporter_name}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(item.date_lost_found).toLocaleDateString('en-ZM')}</td>
                    <td><Link to={`/items/${item.id}`} className="btn btn-outline btn-sm">View <Icon name="arrowRight" size={14} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="table-card">
            <h2>All Users ({users.length})</h2>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Student ID</th><th>Role</th><th>Joined</th><th>Change Role</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{u.student_id || 'N/A'}</td>
                    <td><span className={`badge badge-${u.role === 'admin' ? 'approved' : u.role === 'staff' ? 'claimed' : 'found'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString('en-ZM')}</td>
                    <td>
                      <select className="filter-select" style={{ fontSize: '0.82rem', padding: '4px 8px' }}
                        value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
