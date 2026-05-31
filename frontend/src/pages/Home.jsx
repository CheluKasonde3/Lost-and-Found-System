import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({ lost: 0, found: 0, claimed: 0 });

  useEffect(() => {
    axios.get('/api/items?limit=6').then(r => {
      setRecent(r.data.items);
      const s = { lost: 0, found: 0, claimed: 0 };
      r.data.items.forEach(i => { if (s[i.status] !== undefined) s[i.status]++; });
      setStats(s);
    }).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div>
            <h1>ZUT Lost &amp; Found System</h1>
            <p>
              Track lost and found property across campus, submit claims, and
              help return items to the right owner.
            </p>
          </div>

          <div className="hero-actions">
            <Link to="/items?status=lost" className="btn btn-primary">
              <Icon name="search" size={18} /> Browse Lost Items
            </Link>
            <Link to="/items?status=found" className="btn btn-outline">
              <Icon name="package" size={18} /> Browse Found Items
            </Link>
            {user && !isAdmin && (
              <Link to="/report" className="btn btn-outline">
                <Icon name="plus" size={18} /> Report an Item
              </Link>
            )}
          </div>

          <div className="hero-stats">
            <div className="hero-stat-card">
              <span className="hero-stat-num">{stats.lost}</span>
              <span className="hero-stat-label">Lost Items</span>
              <Icon name="help" />
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-num">{stats.found}</span>
              <span className="hero-stat-label">Found Items</span>
              <Icon name="package" />
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-num">{stats.claimed}</span>
              <span className="hero-stat-label">Items Reunited</span>
              <Icon name="check" />
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-num">{recent.length}</span>
              <span className="hero-stat-label">Recent Reports</span>
              <Icon name="clipboard" />
            </div>
          </div>
        </div>
      </section>

      <section className="portal-section">
        <div className="container">
          <h2 className="section-title">Quick Links</h2>
          <div className="quick-grid">
            <Link to="/profile" className="quick-link">Profile <Icon name="user" /></Link>
            {isAdmin ? (
              <Link to="/dashboard" className="quick-link">Admin Panel <Icon name="chart" /></Link>
            ) : (
              <Link to="/report" className="quick-link">Report Item <Icon name="clipboard" /></Link>
            )}
            <Link to="/items" className="quick-link">Browse Items <Icon name="search" /></Link>
            {!isAdmin && <Link to="/my-claims" className="quick-link">My Claims <Icon name="file" /></Link>}
          </div>
        </div>
      </section>

      <section className="page">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Items</h2>
            <Link to="/items" className="btn btn-outline">View All <Icon name="arrowRight" size={16} /></Link>
          </div>
          {recent.length > 0 ? (
            <div className="items-grid">
              {recent.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><Icon name="package" /></div>
              <p>No items reported yet. Be the first to report one!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
