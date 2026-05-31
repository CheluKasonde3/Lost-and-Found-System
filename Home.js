import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
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
      {/* HERO */}
      <section className="hero">
        <h1>ZUT Lost &amp; Found System</h1>
        <p>
          Helping the Zambia University of Technology community reunite with
          lost belongings — quickly and easily.
        </p>
        <div className="hero-actions">
          <Link to="/items?status=lost" className="btn btn-amber">🔍 Browse Lost Items</Link>
          <Link to="/items?status=found" className="btn btn-outline-white">📦 Browse Found Items</Link>
          {user && <Link to="/report" className="btn btn-outline-white">➕ Report an Item</Link>}
        </div>
        <div className="hero-stats">
          <div>
            <span className="hero-stat-num">{stats.lost}</span>
            <span className="hero-stat-label">Items Lost</span>
          </div>
          <div>
            <span className="hero-stat-num">{stats.found}</span>
            <span className="hero-stat-label">Items Found</span>
          </div>
          <div>
            <span className="hero-stat-num">{stats.claimed}</span>
            <span className="hero-stat-label">Items Reunited</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: 'var(--teal-light)', padding: '3rem 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {[
              { icon: '📝', title: 'Report', desc: 'Log a lost or found item with details and a photo.' },
              { icon: '🔍', title: 'Search', desc: 'Browse or search the database for your item.' },
              { icon: '✉️', title: 'Claim', desc: 'Submit a claim describing why the item is yours.' },
              { icon: '✅', title: 'Reunite', desc: 'Admin approves the claim and you collect your item.' },
            ].map(s => (
              <div key={s.title}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{s.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT ITEMS */}
      <section className="page">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Items</h2>
            <Link to="/items" className="btn btn-outline">View All →</Link>
          </div>
          {recent.length > 0 ? (
            <div className="items-grid">
              {recent.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No items reported yet. Be the first to report one!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
