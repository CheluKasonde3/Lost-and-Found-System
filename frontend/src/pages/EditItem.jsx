import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Accessories',
  'Documents',
  'Keys',
  'Bags',
  'Books',
  'Wallet',
  'Phone',
  'Laptop',
  'Jewelry',
  'Stationery',
  'Personal Items',
  'Other',
];
const STATUSES = ['lost', 'found', 'claimed', 'resolved'];

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const fileRef = useRef();

  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/items/${id}`).then(r => {
      const item = r.data;
      if (item.reported_by !== user?.id && !isAdmin) { navigate('/items'); return; }
      setForm({
        title: item.title, description: item.description,
        category: item.category, status: item.status,
        location: item.location,
        date_lost_found: item.date_lost_found?.split('T')[0] || '',
      });
      if (item.image_url) setPreview(`http://localhost:5000${item.image_url}`);
    }).catch(() => navigate('/items'));
  }, [id, user, isAdmin, navigate]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (image) data.append('image', image);

    try {
      await axios.put(`/api/items/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/items/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="form-card">
          <h1 className="form-title">Edit Item</h1>
          <p className="form-subtitle">Update the details for this item.</p>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)} required>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)} required>
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input className="form-control" value={form.location} onChange={e => set('location', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={form.date_lost_found} onChange={e => set('date_lost_found', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-control" rows={4} value={form.description} onChange={e => set('description', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Photo</label>
              <div className="upload-area" onClick={() => fileRef.current.click()}>
                <input ref={fileRef} type="file" accept="image/*" onChange={e => { setImage(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); }} />
                {preview ? <img src={preview} alt="Preview" className="upload-preview" /> : <p><Icon name="camera" size={18} /> Click to upload a new photo</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : <>Save Changes <Icon name="check" size={16} /></>}</button>
              <button type="button" className="btn btn-outline" onClick={() => navigate(`/items/${id}`)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
