import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Icon from '../components/Icon';

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/claims/mine')
      .then(r => setClaims(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>My Claims</h1>
          <p>Track the status of items you've claimed.</p>
        </div>
      </div>
      <div className="container">
        {claims.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="clipboard" /></div>
            <p>You haven't submitted any claims yet.</p>
            <Link to="/items" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Items <Icon name="arrowRight" size={16} /></Link>
          </div>
        ) : (
          <div className="table-card">
            <h2>Your Claim History ({claims.length})</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Your Description</th>
                  <th>Claim Status</th>
                  <th>Item Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.item_title}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description}
                    </td>
                    <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                    <td><span className={`badge badge-${c.item_status}`}>{c.item_status}</span></td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(c.created_at).toLocaleDateString('en-ZM')}
                    </td>
                    <td>
                      <Link to={`/items/${c.item_id}`} className="btn btn-outline btn-sm">View <Icon name="arrowRight" size={14} /></Link>
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
