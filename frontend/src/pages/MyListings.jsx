import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { listingsAPI } from '../utils/api';
import { formatPrice, formatDate, SUBCATEGORY_ICONS, CATEGORIES } from '../utils/helpers';
import { Spinner } from '../components/common/UI';

export default function MyListings() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    listingsAPI.getByUser()
      .then(res => setListings(res.listings || res))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [user]);

  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    await listingsAPI.delete(id);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  if (loading) return <div style={{ paddingTop: 100, display: 'flex', justifyContent: 'center' }}><Spinner size={40} /></div>;

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--off-white)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>📋 My Listings</h1>
          <Link to="/post-listing" style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--green-primary)', color: '#fff', fontSize: 14, fontWeight: 600 }}>+ Post New</Link>
        </div>

        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🌾</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No listings yet</h3>
            <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>Post your first listing to reach buyers in the community</p>
            <Link to="/post-listing" style={{ padding: '12px 28px', borderRadius: 8, background: 'var(--green-primary)', color: '#fff', fontSize: 14, fontWeight: 600 }}>Post a Listing</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {listings.map(l => (
              <div key={l.id} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid var(--gray-200)', display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                  {l.image_url ? <img src={l.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : (SUBCATEGORY_ICONS[l.subcategory] || CATEGORIES[l.category]?.icon || '📦')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>{l.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--green-primary)', fontWeight: 600 }}>{formatPrice(l.price)}{l.unit ? ` / ${l.unit}` : ''}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{formatDate(l.created_at)} · {l.is_active ? '✅ Active' : '🙈 Hidden'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Link to={`/marketplace/${l.id}`} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--gray-200)', fontSize: 12, color: 'var(--gray-700)' }}>View</Link>
                  <button onClick={() => deleteListing(l.id)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
