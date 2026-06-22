import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

export default function Profile() {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || '',
    bio: user?.bio || '',
    user_type: user?.user_type || 'general',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.put('/auth/profile', form);
      setUser(res.user || { ...user, ...form });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--off-white)' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 24 }}>👤 My Profile</h1>

        {success && <div style={{ padding: '12px 16px', background: '#e8f8ef', borderRadius: 8, color: 'var(--green-primary)', fontSize: 14, marginBottom: 20, fontWeight: 600 }}>✅ Profile updated successfully!</div>}
        {error && <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 14, marginBottom: 20 }}>⚠️ {error}</div>}

        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', marginBottom: 20 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</div>
              <div style={{ color: 'var(--gray-500)', fontSize: 13 }}>{user.email}</div>
              <div style={{ color: 'var(--gray-400)', fontSize: 12, marginTop: 2 }}>Member since {formatDate(user.created_at)}</div>
            </div>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input value={form.name} onChange={e => update('name', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Phone Number</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>WhatsApp Number</label>
              <input value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} placeholder="Leave blank if same as phone" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Account Type</label>
              <select value={form.user_type} onChange={e => update('user_type', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 14, boxSizing: 'border-box' }}>
                {['general', 'farmer', 'buyer', 'retailer', 'wholesaler', 'agrovet', 'vet', 'landlord'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Bio</label>
              <textarea value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell the community about yourself..." rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'var(--green-primary)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/my-listings" style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid var(--green-light)', background: 'var(--green-pale)', color: 'var(--green-primary)', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>📋 My Listings</Link>
          <Link to="/messages" style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid var(--gray-200)', background: '#fff', color: 'var(--gray-700)', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>💬 Messages</Link>
        </div>
      </div>
    </div>
  );
}
