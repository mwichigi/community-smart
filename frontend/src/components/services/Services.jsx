import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI } from '../../utils/api';
import { formatDate, truncate } from '../../utils/helpers';
import { Card, Badge, Spinner, EmptyState } from '../common/UI';
import { MapView } from '../common/MapComponents';

const SERVICE_TYPES = [
  { value: 'vet', label: '💉 Veterinary', color: 'blue', desc: 'Animal health, vaccines, treatment' },
  { value: 'agrovet', label: '🌿 Agrovet', color: 'green', desc: 'Feeds, fertilizers, pesticides, seeds' },
  { value: 'transport', label: '🚛 Transport', color: 'earth', desc: 'Goods delivery, farm transport' },
  { value: 'tractor', label: '🚜 Tractor Hire', color: 'gold', desc: 'Ploughing, harrowing, planting' },
  { value: 'labour', label: '👷 Farm Labour', color: 'earth', desc: 'Casual workers, harvesting crews' },
  { value: 'other', label: '🔧 Other', color: 'earth', desc: 'Any other farm service' },
];

const DEMO_SERVICES = [
  {
    id: 1, type: 'vet', name: 'Dr. Samuel Kimani - Mobile Vet Services', provider: 'Dr. Samuel Kimani',
    description: 'Experienced vet with 10+ years. Services: dairy cow treatment, AI (artificial insemination), deworming, vaccination, sheep & pig health.',
    phone: '0720111222', whatsapp: '0720111222', operating_hours: 'Mon-Sat 7am–6pm',
    location_lat: -0.494, location_lng: 36.507, location_name: 'Community Smart Centre', created_at: new Date().toISOString(),
    tags: ['Dairy Cows', 'Artificial Insemination', 'Pigs', 'Sheep', 'Poultry'],
  },
  {
    id: 2, type: 'agrovet', name: 'Community Smart Agrovet & Farm Supplies', provider: 'Mary Wathimu',
    description: 'Full agrovet services: fertilizers (CAN, DAP, NPK), certified seeds, all pesticides & herbicides, animal feeds and supplements.',
    phone: '0731222333', whatsapp: '0731222333', operating_hours: 'Mon-Sun 6:30am–7pm',
    location_lat: -0.491, location_lng: 36.509, location_name: 'Community Smart Main Road',
    tags: ['Fertilizers', 'Seeds', 'Pesticides', 'Animal Feeds', 'Medicine'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3, type: 'tractor', name: 'Kamau Tractor Services', provider: 'Joseph Kamau',
    description: 'Tractor ploughing, harrowing and planting. KES 3,500 per acre. Quick turnaround, serves Community Smart and neighboring areas.',
    phone: '0742333444', operating_hours: 'Seasonal — Call to book',
    location_lat: -0.506, location_lng: 36.493, location_name: 'Community Smart', created_at: new Date(Date.now() - 172800000).toISOString(),
    tags: ['Ploughing', 'Harrowing', 'Planting'],
  },
  {
    id: 4, type: 'transport', name: 'Community Smart Pickup — Farm Produce Transport', provider: 'Peter Njoroge',
    description: 'Toyota pickup for hire. Transport farm produce to Ol Kalou, Naivasha, Nakuru markets. Refrigerated not available but quick trips.',
    phone: '0753444555', whatsapp: '0753444555', operating_hours: 'Daily from 4am',
    location_lat: -0.499, location_lng: 36.501, location_name: 'Community Smart', created_at: new Date(Date.now() - 259200000).toISOString(),
    tags: ['Pickup', 'Ol Kalou', 'Naivasha', 'Nakuru'],
  },
];

function ServiceCard({ service }) {
  const typeInfo = SERVICE_TYPES.find(t => t.value === service.type);
  const waLink = `https://wa.me/${(service.whatsapp || service.phone)?.replace(/\D/g, '')?.replace(/^0/, '254')}?text=${encodeURIComponent(`Hi, I found your service "${service.name}" on Community Smart. I need help.`)}`;

  return (
    <Card style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 20, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: typeInfo?.value === 'vet' ? 'var(--sky-light)' : typeInfo?.value === 'agrovet' ? 'var(--green-pale)' : '#fef9e7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>{typeInfo?.label?.split(' ')[0] || '🔧'}</div>
          <div style={{ flex: 1 }}>
            <Badge color={typeInfo?.color || 'earth'}>{typeInfo?.label?.split(' ').slice(1).join(' ') || service.type}</Badge>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginTop: 6, lineHeight: 1.3 }}>{truncate(service.name, 60)}</h3>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>by {service.provider}</p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 14 }}>{truncate(service.description, 120)}</p>

        {service.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {service.tags.map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'var(--gray-100)', color: 'var(--gray-600)', fontWeight: 500 }}>{tag}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--gray-500)', marginBottom: 16, flexWrap: 'wrap' }}>
          {service.operating_hours && <span>🕐 {service.operating_hours}</span>}
          {service.location_name && <span>📍 {service.location_name}</span>}
        </div>

        <div style={{ display: 'flex', gap: 7 }}>
          <a href={`tel:${service.phone}`} style={{ flex: 1, padding: '9px', borderRadius: 8, fontSize: 12, fontWeight: 600, textAlign: 'center', background: 'var(--sky-light)', color: 'var(--sky)', border: '1.5px solid var(--sky)' }}>📞 Call</a>
          {(service.whatsapp || service.phone) && (
            <a href={waLink} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '9px', borderRadius: 8, fontSize: 12, fontWeight: 600, textAlign: 'center', background: '#e8f8ef', color: '#25d366', border: '1.5px solid #25d366' }}>WhatsApp</a>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    servicesAPI.getAll({ type: activeType })
      .then(res => setServices(res.services || res))
      .catch(() => setServices(DEMO_SERVICES))
      .finally(() => setLoading(false));
  }, [activeType]);

  const filtered = activeType ? services.filter(s => s.type === activeType) : services;

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c, #1a7ab5)', padding: '32px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>🔧 Services Directory</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 }}>Find vets, agrovets, transport and farm services near Community Smart</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setActiveType('')} style={{
              padding: '8px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 600,
              background: !activeType ? '#fff' : 'rgba(255,255,255,0.15)',
              color: !activeType ? 'var(--sky)' : '#fff', cursor: 'pointer',
            }}>All Services</button>
            {SERVICE_TYPES.map(t => (
              <button key={t.value} onClick={() => setActiveType(t.value)} style={{
                padding: '8px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 600,
                background: activeType === t.value ? '#fff' : 'rgba(255,255,255,0.15)',
                color: activeType === t.value ? 'var(--sky)' : '#fff', cursor: 'pointer',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Service type cards */}
      {!activeType && (
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-100)', padding: '24px 20px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {SERVICE_TYPES.map(t => (
                <button key={t.value} onClick={() => setActiveType(t.value)} style={{
                  padding: '16px', borderRadius: 12, border: '1.5px solid var(--gray-200)',
                  background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sky)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{t.label.split(' ')[0]}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>{t.label.split(' ').slice(1).join(' ')}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>{filtered.length} service{filtered.length !== 1 ? 's' : ''} found</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {['grid', 'map'].map(m => (
              <button key={m} onClick={() => setViewMode(m)} style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: viewMode === m ? 'var(--sky)' : '#fff',
                color: viewMode === m ? '#fff' : 'var(--gray-700)',
                border: `1.5px solid ${viewMode === m ? 'var(--sky)' : 'var(--gray-200)'}`,
              }}>{m === 'grid' ? '⊞ Grid' : '🗺 Map'}</button>
            ))}
            <Link to="/post-service" style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: 'var(--sky)', color: '#fff' }}>+ List Your Service</Link>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
        ) : viewMode === 'map' ? (
          <MapView listings={filtered.map(s => ({ ...s, title: s.name, price: null, category_icon: SERVICE_TYPES.find(t => t.value === s.type)?.label?.split(' ')[0] || '🔧' }))} height={500} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔧" title="No services found" subtitle="Be the first to list your service here" action={<Link to="/post-service" style={{ padding: '10px 24px', background: 'var(--sky)', color: '#fff', borderRadius: 8, fontWeight: 600 }}>List a Service</Link>} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
