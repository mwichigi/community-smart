import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { housingAPI } from '../../utils/api';
import { formatPrice, formatDate, truncate } from '../../utils/helpers';
import { Card, Badge, Spinner, EmptyState, Button, ContactBar } from '../common/UI';
import { MapView } from '../common/MapComponents';

const HOUSE_TYPES = ['Single Room', 'Bedsitter', '1 Bedroom', '2 Bedrooms', '3+ Bedrooms', 'Shop/Commercial'];

const DEMO_HOUSES = [
  { id: 1, title: 'Spacious Bedsitter near Community Smart', type: 'Bedsitter', price: 3500, description: 'Self-contained, water available, secure compound. Near the market centre.', bedrooms: null, bathrooms: 1, landlord_name: 'James Kariuki', phone: '0711222333', whatsapp: '0711222333', location_lat: -0.492, location_lng: 36.508, location_name: 'Community Smart Centre', available: true, created_at: new Date().toISOString() },
  { id: 2, title: '2 Bedroom House with Shamba Space', type: '2 Bedrooms', price: 7500, description: 'Permanent house, iron sheet roof, small kitchen garden space. Borehole water.', bedrooms: 2, bathrooms: 1, landlord_name: 'Ruth Njeri', phone: '0722333444', location_lat: -0.503, location_lng: 36.497, location_name: 'Community Smart', available: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, title: 'Single Room — Ideal for Workers', type: 'Single Room', price: 1800, description: 'Simple and clean. Shared bathroom. Near the posho mill.', landlord_name: 'Patrick Waweru', phone: '0733444555', location_lat: -0.498, location_lng: 36.502, location_name: 'Community Smart', available: true, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 4, title: 'Shop Space for Rent — High Traffic Area', type: 'Shop/Commercial', price: 5000, description: 'Ground floor shop along the main road. Suitable for agrovet, general shop.', landlord_name: 'Alice Muthoni', phone: '0744555666', location_lat: -0.488, location_lng: 36.512, location_name: 'Community Smart Main Rd', available: true, created_at: new Date(Date.now() - 259200000).toISOString() },
];

function HouseCard({ house, onContact }) {
  const waLink = `https://wa.me/${(house.whatsapp || house.phone)?.replace(/\D/g, '')?.replace(/^0/, '254')}?text=${encodeURIComponent(`Hi, I'm interested in your house listing "${house.title}" on Community Smart.`)}`;
  return (
    <Card>
      {/* Image placeholder */}
      <div style={{ height: 170, background: 'linear-gradient(135deg, #fef9e7, #fdf3e8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, position: 'relative' }}>
        🏠
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge color="gold">{house.type}</Badge>
        </div>
        {house.available && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: '#4caf72', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>AVAILABLE</div>
        )}
      </div>
      <div style={{ padding: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6, lineHeight: 1.3 }}>{truncate(house.title, 55)}</h3>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#b8860b', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          KES {Number(house.price).toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, fontFamily: 'var(--font-body)', color: 'var(--gray-500)' }}>/month</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12, lineHeight: 1.5 }}>{truncate(house.description, 80)}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--gray-600)', fontWeight: 600 }}>👤 {house.landlord_name}</div>
          {house.location_name && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>📍 {house.location_name}</div>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 14 }}>{formatDate(house.created_at)}</div>

        <div style={{ display: 'flex', gap: 7 }}>
          <a href={`tel:${house.phone}`} style={{ flex: 1, padding: '8px', borderRadius: 7, fontSize: 12, fontWeight: 600, textAlign: 'center', background: '#fef9e7', color: '#b8860b', border: '1.5px solid #d4a017' }}>📞 Call</a>
          <a href={waLink} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '8px', borderRadius: 7, fontSize: 12, fontWeight: 600, textAlign: 'center', background: '#e8f8ef', color: '#25d366', border: '1.5px solid #25d366' }}>WhatsApp</a>
          <button onClick={() => onContact(house)} style={{ padding: '8px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, background: 'var(--sky-light)', color: 'var(--sky)', border: '1.5px solid var(--sky)', cursor: 'pointer' }}>💬</button>
        </div>
      </div>
    </Card>
  );
}

export default function Housing() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();

  useEffect(() => {
    housingAPI.getAll({ type: typeFilter, max_price: maxRent })
      .then(res => setHouses(res.houses || res))
      .catch(() => setHouses(DEMO_HOUSES))
      .finally(() => setLoading(false));
  }, [typeFilter, maxRent]);

  const handleContact = (house) => navigate(`/messages?to=${house.landlord_id}&listing=${house.id}`);

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #3d2b1a, #7a5c3e)', padding: '32px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 18 }}>🏠 Housing & Rentals</h1>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{
              padding: '10px 16px', borderRadius: 8, border: 'none', fontSize: 13,
              background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer',
            }}>
              <option value="" style={{ color: '#000' }}>All Types</option>
              {HOUSE_TYPES.map(t => <option key={t} value={t} style={{ color: '#000' }}>{t}</option>)}
            </select>
            <input type="number" value={maxRent} onChange={e => setMaxRent(e.target.value)}
              placeholder="Max rent (KES)" style={{
                padding: '10px 16px', borderRadius: 8, border: 'none', fontSize: 13,
                background: 'rgba(255,255,255,0.15)', color: '#fff', width: 160,
              }} />
            {['grid', 'map'].map(m => (
              <button key={m} onClick={() => setViewMode(m)} style={{
                padding: '10px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
                background: viewMode === m ? '#d4a017' : 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer',
              }}>{m === 'grid' ? '⊞ Grid' : '🗺 Map'}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>{houses.length} properties available</span>
          <Link to="/post-housing" style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: '#d4a017', color: '#fff' }}>+ List Your Property</Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
        ) : viewMode === 'map' ? (
          <MapView listings={houses.map(h => ({ ...h, title: h.title, category_icon: '🏠' }))} height={500} />
        ) : houses.length === 0 ? (
          <EmptyState icon="🏠" title="No properties listed yet" subtitle="Be the first to list your property in Community Smart" action={<Link to="/post-housing" style={{ padding: '10px 24px', background: '#d4a017', color: '#fff', borderRadius: 8, fontWeight: 600 }}>List a Property</Link>} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {houses.map(h => <HouseCard key={h.id} house={h} onContact={handleContact} />)}
          </div>
        )}
      </div>
    </div>
  );
}
