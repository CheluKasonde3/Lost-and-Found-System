import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
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

export default function ReportItem() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({
    title: '', description: '', category: '', status: 'lost',
    location: '', date_lost_found: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [lostItems, setLostItems] = useState([]);
  const [lostLoading, setLostLoading] = useState(false);
  const [selectedLostId, setSelectedLostId] = useState('');
  const [markingFound, setMarkingFound] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    if (form.status !== 'found') {
      setSelectedLostId('');
      return;
    }

    setLostLoading(true);
    axios.get('/api/items', { params: { status: 'lost', limit: 50 } })
      .then(r => setLostItems(r.data.items || []))
      .catch(() => setLostItems([]))
      .finally(() => setLostLoading(false));
  }, [form.status]);

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (image) data.append('image', image);

    try {
      const res = await axios.post('/api/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/items/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFound = async () => {
    if (!selectedLostId) return;
    setError('');
    setMarkingFound(true);

    try {
      await axios.put(`/api/items/${selectedLostId}/mark-found`);
      navigate(`/items/${selectedLostId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark this item as found.');
    } finally {
      setMarkingFound(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="form-card">
          <h1 className="form-title">Report an Item</h1>
          <p className="form-subtitle">Fill in the details about the lost or found item.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Status toggle */}
            <div className="form-group">
              <label className="form-label">Type *</label>
              <div className="radio-row">
                {['lost', 'found'].map(s => (
                  <label key={s} className="radio-pill">
                    <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => set('status', s)} />
                    <Icon name={s === 'lost' ? 'help' : 'package'} size={16} />
                    {s === 'lost' ? 'I Lost Something' : 'I Found Something'}
                  </label>
                ))}
              </div>
            </div>

            {form.status === 'found' && (
              <div className="found-helper">
                <div className="found-helper-header">
                  <div>
                    <h2>Select a matching lost report</h2>
                    <p>Mark it found instantly, or continue with a new report below.</p>
                  </div>
                  <Link to="/items?status=lost" className="btn btn-outline btn-sm">
                    Browse All <Icon name="search" size={14} />
                  </Link>
                </div>

                {lostLoading ? (
                  <div className="found-lost-empty">Loading lost items...</div>
                ) : lostItems.length === 0 ? (
                  <div className="found-lost-empty">No lost reports are available right now.</div>
                ) : (
                  <div className="found-lost-list">
                    {lostItems.slice(0, 6).map(item => (
                      <label key={item.id} className="found-lost-option">
                        <input
                          type="radio"
                          name="selectedLostItem"
                          value={item.id}
                          checked={String(selectedLostId) === String(item.id)}
                          onChange={e => setSelectedLostId(e.target.value)}
                        />
                        <span>
                          <strong>{item.title}</strong>
                          <small>{item.location} - {new Date(item.date_lost_found).toLocaleDateString('en-ZM')}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!selectedLostId || markingFound}
                  onClick={handleMarkFound}
                >
                  {markingFound ? 'Marking Found...' : <>Mark Selected Item Found <Icon name="check" size={16} /></>}
                </button>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" placeholder="e.g. Black Samsung Galaxy S22" value={form.title}
                onChange={e => set('title', e.target.value)} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date {form.status === 'found' ? 'Found' : 'Lost'} *</label>
                <input type="date" className="form-control" value={form.date_lost_found}
                  onChange={e => set('date_lost_found', e.target.value)} required max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input className="form-control" placeholder="e.g. Library, Block C Lecture Room 3, Cafeteria"
                value={form.location} onChange={e => set('location', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-control" rows={4}
                placeholder="Describe the item in detail: colour, brand, any unique features, serial numbers, etc."
                value={form.description} onChange={e => set('description', e.target.value)} required />
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label className="form-label">Photo (optional)</label>
              <div
                className={`upload-area ${dragging ? 'drag-over' : ''}`}
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="upload-preview" />
                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click to change</p>
                  </>
                ) : (
                  <>
                    <Icon name="camera" size={44} />
                    <p style={{ fontWeight: 600 }}>Click or drag &amp; drop a photo</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>JPG, PNG, WEBP, max 5 MB</p>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting...' : <>Submit Report <Icon name="upload" size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
