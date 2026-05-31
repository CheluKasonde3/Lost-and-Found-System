import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import logo from '../assets/logo-v2.png';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setNavOpen(false);
    navigate('/');
  };

  const closeNav = () => setNavOpen(false);

  const navItems = user ? [
    { to: '/', label: 'Dashboard', icon: 'home' },
    { to: '/items', label: 'Browse Items', icon: 'search' },
    ...(!isAdmin ? [{ to: '/report', label: 'Report Item', icon: 'clipboard' }] : []),
    ...(!isAdmin ? [{ to: '/my-claims', label: 'My Claims', icon: 'file' }] : []),
    ...(isAdmin ? [{ to: '/dashboard', label: 'Admin Panel', icon: 'chart' }] : []),
    { to: '/profile', label: 'My Account', icon: 'user' },
  ] : [
    { to: '/', label: 'Dashboard', icon: 'home' },
    { to: '/items', label: 'Browse Items', icon: 'search' },
    { to: '/login', label: 'Login', icon: 'user' },
    { to: '/register', label: 'Register', icon: 'clipboard' },
  ];

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="icon-button"
            type="button"
            aria-label="Menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(open => !open)}
          >
            <Icon name="menu" size={22} />
          </button>
          <Link to="/" className="topbar-user" onClick={closeNav}>
            <span className="avatar">{user?.full_name?.charAt(0).toUpperCase() || 'Z'}</span>
            <span>{user ? user.full_name : 'ZUT Portal'}</span>
          </Link>
        </div>
        <Link to="/" className="topbar-logo" aria-label="ZUT Lost and Found" onClick={closeNav}>
          <img src={logo} alt="ZUT Lost and Found" />
        </Link>
      </header>

      {navOpen && <button className="nav-backdrop" type="button" aria-label="Close menu" onClick={closeNav} />}

      <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
        <Link to="/" className="sidebar-brand" onClick={closeNav}>
          <span className="brand-mark"><Icon name="package" size={22} /></span>
          <span>
            <strong>Lost &amp; Found</strong>
            <small>Zambia University of Technology</small>
          </span>
        </Link>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className="sidebar-link" onClick={closeNav}>
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="sidebar-section">
            <NavLink to="/items?status=found" className="sidebar-link" onClick={closeNav}>
              <Icon name="package" size={20} />
              <span>Found Items</span>
            </NavLink>
            <NavLink to="/items?status=lost" className="sidebar-link" onClick={closeNav}>
              <Icon name="help" size={20} />
              <span>Lost Items</span>
            </NavLink>
          </div>
          {user && (
            <button className="sidebar-link sidebar-button" onClick={handleLogout} type="button">
              <Icon name="logout" size={20} />
              <span>Logout</span>
            </button>
          )}
        </nav>
      </aside>
    </>
  );
}
