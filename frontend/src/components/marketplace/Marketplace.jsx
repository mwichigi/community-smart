import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listingsAPI } from '../../utils/api';
import { formatPrice, formatDate, CATEGORIES, SUBCATEGORY_ICONS, truncate } from '../../utils/helpers';
import { Card, Badge, Spinner, EmptyState, Button } from '../common/UI';
import { MapView } from '../common/MapComponents';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'nearest', label: 'Nearest First' },
];

function ListingCard({ item }) {
  const waLink = `https://wa.me/${(item.whatsapp || item.phone)?.replace(/\D/g, '')?.replace(/^0/, '254')}?text=${encodeURIComponent(`Hi, I saw your listing "${item.title}" on Community Smart.`)}`;
  return (
    <Card style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 180, background: 'var(--gray-100)', overflow: 'hidden' }}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, background: 'var(--green-pale)' }}>
            {SUBCATEGORY_ICONS[item.subcategory] || CATEGORIES[item.category]?.icon || '📦'}
          </div>
        )}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge color={item.category === 'produce' ? 'green' : item.category === 'agrovet' ? 'blue' : 'earth'}>
            {CATEGORIES[item.category]?.label || item.category}
          </Badge>
        </div>
        {item.quantity && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
            {item.quantity} {item.unit}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6, lineHeight: 1.3 }}>
          <Link to={`/marketplace/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{truncate(item.title, 55)}</Link>
        </h3>

        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-primary)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
          {formatPrice(item.price)}
          {item.unit && item.price && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--gray-500)', fontFamily: 'var(--font-body)' }}> / {item.unit}</span>}
        </div>

        <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 12, flex: 1 }}>{truncate(item.description, 80)}</p>

        {/* Seller + location */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: 'var(--green-primary)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
            }}>{item.seller_name?.[0]?.toUpperCase() || 'S'}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>{item.seller_name || 'Seller'}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{formatDate(item.created_at)}</div>
            </div>
          </div>
          {item.location_lat && (
            <div style={{ fontSize: 11, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 3 }}>
              📍 {item.location_name || 'Pinned'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 7 }}>
          <a href={`tel:${item.phone}`} style={{
            flex: 1, padding: '8px', borderRadius: 7, fontSize: 12, fontWeight: 600, textAlign: 'center',
            background: 'var(--green-pale)', color: 'var(--green-primary)', border: '1.5px solid var(--green-light)',
          }}>📞 Call</a>
          <a href={waLink} target="_blank" rel="noreferrer" style={{
            flex: 1, padding: '8px', borderRadius: 7, fontSize: 12, fontWeight: 600, textAlign: 'center',
            background: '#e8f8ef', color: '#25d366', border: '1.5px solid #25d366',
          }}>WhatsApp</a>
          <Link to={`/marketplace/${item.id}`} style={{
            padding: '8px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
            background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1.5px solid var(--gray-200)',
          }}>→</Link>
        </div>
      </div>
    </Card>
  );
}

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listingsAPI.getAll({ search, category, sort, page, limit: 12 });
      setListings(res.listings || res);
      setTotal(res.total || res.length || 0);
    } catch {
      // fallback to demo data
      setListings(DEMO_LISTINGS);
      setTotal(DEMO_LISTINGS.length);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--green-deep)', padding: '28px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 16 }}>🌽 Farm Marketplace</h1>
          {/* Search */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search eggs, milk, maize, beans..."
                style={{ width: '100%', padding: '11px 14px 11px 42px', borderRadius: 8, border: 'none', fontSize: 14, background: 'rgba(255,255,255,0.12)', color: '#fff' }}
              />
            </div>
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} style={{
              padding: '11px 16px', borderRadius: 8, border: 'none', fontSize: 14,
              background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer',
            }}>
              <option value="" style={{ color: '#000' }}>All Categories</option>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <option key={k} value={k} style={{ color: '#000' }}>{v.icon} {v.label}</option>
              ))}
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              padding: '11px 16px', borderRadius: 8, border: 'none', fontSize: 14,
              background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer',
            }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ color: '#000' }}>{o.label}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 4 }}>
              {['grid', 'map'].map(m => (
                <button key={m} onClick={() => setViewMode(m)} style={{
                  padding: '11px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
                  background: viewMode === m ? '#4caf72' : 'rgba(255,255,255,0.12)',
                  color: '#fff', cursor: 'pointer',
                }}>{m === 'grid' ? '⊞ Grid' : '🗺 Map'}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        {/* Results count + Post CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>
            {loading ? 'Loading…' : `${total} listing${total !== 1 ? 's' : ''} found`}
          </span>
          <Link to="/post-listing" style={{
            padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: 'var(--green-primary)', color: '#fff',
          }}>+ Post a Listing</Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
        ) : viewMode === 'map' ? (
          <div>
            <MapView listings={listings} height={500} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 24 }}>
              {listings.map(item => <ListingCard key={item.id} item={item} />)}
            </div>
          </div>
        ) : listings.length === 0 ? (
          <EmptyState icon="🌾" title="No listings found" subtitle="Try different search terms or check back soon." action={<Link to="/post-listing" style={{ padding: '10px 24px', background: 'var(--green-primary)', color: '#fff', borderRadius: 8, fontWeight: 600 }}>Be the first to post</Link>} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {listings.map(item => <ListingCard key={item.id} item={item} />)}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 }}>
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
            <span style={{ padding: '10px 16px', fontSize: 14, color: 'var(--gray-500)' }}>Page {page}</span>
            <Button variant="secondary" disabled={page * 12 >= total} onClick={() => setPage(p => p + 1)}>Next →</Button>
          </div>
        )}
      </div>
    </div>
  );
}

const DEMO_LISTINGS = [
  { id: 1, title: 'Fresh Chicken Eggs', category: 'produce', price: 450, unit: 'Tray', quantity: 3, description: 'Fresh eggs from free-range layers. Available every morning.', seller_name: 'Grace Wanjiru', phone: '0712345678', whatsapp: '0712345678', location_lat: -0.49, location_lng: 36.51, location_name: 'Community Smart', created_at: new Date().toISOString() },
  { id: 2, title: 'Irish Potato (Waru) - Grade A', category: 'produce', price: 2800, unit: 'Bag (90kg)', quantity: 15, description: 'Clean, large potatoes. Good for market. Can deliver to Ol Kalou.', seller_name: 'Peter Kamau', phone: '0722111222', whatsapp: '0722111222', location_lat: -0.51, location_lng: 36.49, location_name: 'Community Smart', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, title: 'Fresh Cow Milk', category: 'produce', price: 55, unit: 'Litre', quantity: 30, description: 'Fresh raw milk from healthy dairy cows. Morning collection.', seller_name: 'John Mwangi', phone: '0733222333', location_lat: -0.495, location_lng: 36.505, location_name: 'Community Smart', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 4, title: 'Green Maize (Mahindi Mabichi)', category: 'produce', price: 25, unit: 'Pieces', quantity: 200, description: 'Sweet green maize ready for boiling. Sold per cob.', seller_name: 'Mary Njoki', phone: '0744333444', location_lat: -0.505, location_lng: 36.495, location_name: 'Community Smart', created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 5, title: 'Dry Beans (Mwitemania)', category: 'produce', price: 130, unit: 'Kgs', quantity: 50, description: 'Dry beans, clean and ready for cooking or resale.', seller_name: 'David Gitau', phone: '0755444555', location_lat: -0.485, location_lng: 36.515, location_name: 'Community Smart', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 6, title: 'Broiler Chickens (Live)', category: 'produce', price: 650, unit: 'Pieces', quantity: 40, description: 'Ready-for-market broilers, 6 weeks old, average 2.5kg.', seller_name: 'Ann Wangui', phone: '0766555666', location_lat: -0.508, location_lng: 36.502, location_name: 'Community Smart', created_at: new Date(Date.now() - 172800000).toISOString() },
];
