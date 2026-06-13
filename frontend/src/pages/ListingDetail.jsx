import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsAPI, messagesAPI } from '../utils/api';
import { formatPrice, formatDate, SUBCATEGORY_ICONS, CATEGORIES } from '../utils/helpers';
import { useApp } from '../context/AppContext';
import { Spinner, Button } from '../components/common/UI';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    listingsAPI.getOne(id)
      .then(res => setListing(res.listing || res))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async () => {
    if (!user) { navigate('/login'); return; }
    if (!message.trim()) return;
    setSending(true);
    try {
      await messagesAPI.sendMessage({ to: listing.seller_id, text: message });
      setSent(true);
      setMessage('');
    } catch { }
    setSending(false);
  };

  if (loading) return <div style={{ paddingTop: 100, display: 'flex', justifyContent: 'center' }}><Spinner size={40} /></div>;
  if (!listing) return (
    <div style={{ paddingTop: 100, textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>🌾</div>
      <h2>Listing not found</h2>
      <Link to="/marketplace" style={{ color: 'var(--green-primary)' }}>← Back to Marketplace</Link>
    </div>
  );

  const waLink = `https://wa.me/${(listing.whatsapp || listing.phone)?.replace(/\D/g, '')?.replace(/^0/, '254')}?text=${encodeURIComponent(`Hi, I saw your listing "${listing.title}" on Community Smart.`)}`;
  const icon = SUBCATEGORY_ICONS[listing.subcategory] || CATEGORIES[listing.category]?.icon || '📦';

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--off-white)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
        {/* Back */}
        <Link to="/marketplace" style={{ color: 'var(--green-primary)', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>← Back to Marketplace</Link>

        {/* Main card */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', overflow: 'hidden', marginBottom: 20 }}>
          {/* Image */}
          <div style={{ height: 280, background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {listing.image_url ? (
              <img src={listing.image_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontSize: 100 }}>{icon}</div>
            )}
          </div>

          {/* Details */}
          <div style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ background: 'var(--green-pale)', color: 'var(--green-primary)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  {CATEGORIES[listing.category]?.label || listing.category}
                </span>
                {listing.subcategory && <span style={{ marginLeft: 8, background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>{listing.subcategory}</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{formatDate(listing.created_at)}</div>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--gray-900)', margin: '16px 0 8px' }}>{listing.title}</h1>

            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-primary)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
              {formatPrice(listing.price)}
              {listing.unit && listing.price && <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--gray-500)', fontFamily: 'var(--font-body)' }}> / {listing.unit}</span>}
            </div>

            <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 20 }}>{listing.description}</p>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
              {listing.quantity && <div style={{ background: 'var(--gray-50)', padding: '12px 16px', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>QUANTITY</div>
                <div style={{ fontWeight: 700 }}>{listing.quantity} {listing.unit}</div>
              </div>}
              {listing.location_name && <div style={{ background: 'var(--gray-50)', padding: '12px 16px', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>LOCATION</div>
                <div style={{ fontWeight: 700 }}>📍 {listing.location_name}</div>
              </div>}
              {listing.delivery_available && <div style={{ background: 'var(--green-pale)', padding: '12px 16px', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>DELIVERY</div>
                <div style={{ fontWeight: 700, color: 'var(--green-primary)' }}>✅ Available</div>
              </div>}
            </div>

            {/* Seller info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--gray-50)', borderRadius: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>
                {listing.seller_name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{listing.seller_name || 'Seller'}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Listed {formatDate(listing.created_at)}</div>
              </div>
            </div>

            {/* Contact buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href={`tel:${listing.phone}`} style={{ flex: 1, minWidth: 120, padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textAlign: 'center', background: 'var(--green-pale)', color: 'var(--green-primary)', border: '2px solid var(--green-light)' }}>📞 Call Seller</a>
              <a href={waLink} target="_blank" rel="noreferrer" style={{ flex: 1, minWidth: 120, padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textAlign: 'center', background: '#e8f8ef', color: '#25d366', border: '2px solid #25d366' }}>💬 WhatsApp</a>
            </div>
          </div>
        </div>

        {/* Message seller */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>💬 Message Seller</h3>
          {sent ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--green-primary)', fontWeight: 600 }}>
              ✅ Message sent! <Link to="/messages" style={{ color: 'var(--green-primary)', marginLeft: 8 }}>View in Messages →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={`Hi, I'm interested in "${listing.title}". Is it still available?`}
                rows={3}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--gray-200)', fontSize: 14, resize: 'vertical', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
              />
              <button onClick={sendMessage} disabled={sending || !message.trim()} style={{
                padding: '12px 24px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700,
                background: message.trim() ? 'var(--green-primary)' : 'var(--gray-200)',
                color: '#fff', cursor: message.trim() ? 'pointer' : 'not-allowed', alignSelf: 'flex-end',
              }}>
                {sending ? 'Sending...' : user ? 'Send Message' : 'Login to Message'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
