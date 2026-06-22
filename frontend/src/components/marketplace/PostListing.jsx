import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { listingsAPI, housingAPI, uploadAPI } from '../../utils/api';
import { Button, Input, Select, Textarea } from '../common/UI';
import { MapPicker } from '../common/MapComponents';
import { CATEGORIES, UNIT_OPTIONS } from '../../utils/helpers';

const LISTING_TYPES = [
  { value: 'produce', label: '🌽 Farm Produce', desc: 'Eggs, milk, potatoes, maize, beans...' },
  { value: 'agrovet', label: '🌿 Agrovet Supplies', desc: 'Fertilizers, feeds, pesticides, seeds...' },
  { value: 'services', label: '🔧 Service', desc: 'Vet, transport, tractor hire, labour...' },
  { value: 'housing', label: '🏠 Housing & Rentals', desc: 'Single room, bedsitter, 1-3 bedrooms, shop...' },
];

export default function PostListing() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: '', title: '', category: '', subcategory: '', description: '',
    price: '', unit: '', quantity: '', phone: user?.phone || '', whatsapp: user?.whatsapp || '',
    location_lat: '', location_lng: '', location_name: '',
    available_from: '', available_until: '', delivery_available: false,
    image_url: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileRef = React.useRef(null);
  const [success, setSuccess] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await uploadAPI.image(fd);
      update('image_url', res.url);
    } catch {
      // keep preview, skip remote
    } finally { setUploading(false); }
  };

  const validate = () => {
    const e = {};
    if (!form.type) e.type = 'Select a listing type';
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.phone) e.phone = 'Phone number is required';
    if (!form.location_lat) e.location = 'Please pin your location on the map';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setLoading(true);
    try {
      if (form.type === 'housing') {
        await housingAPI.create({ ...form, type: form.subcategory || 'Single Room' });
        setSuccess(true);
        setTimeout(() => navigate('/housing'), 2500);
      } else {
        await listingsAPI.create({ ...form, category: form.type });
        setSuccess(true);
        setTimeout(() => navigate('/marketplace'), 2500);
      }
    } catch (err) {
      setErrors({ server: err.message });
    } finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: 'var(--off-white)' }}>
      <div style={{ fontSize: 72 }}>🎉</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--green-primary)' }}>Listing Posted!</h2>
      <p style={{ color: 'var(--gray-500)' }}>Redirecting to marketplace…</p>
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--gray-900)' }}>Login Required</h2>
      <p style={{ color: 'var(--gray-500)' }}>You must be logged in to post a listing.</p>
      <Button onClick={() => navigate('/login')}>Sign In</Button>
    </div>
  );

  const subcats = form.type ? CATEGORIES[form.type]?.subcategories : [];

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--off-white)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 20px 60px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>Post a Listing</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Share what you have to offer with the Community Smart community</p>
        </div>

        {errors.server && (
          <div style={{ padding: '12px 16px', background: 'var(--red-pale)', borderRadius: 8, color: 'var(--red-alert)', fontSize: 14, marginBottom: 24 }}>⚠️ {errors.server}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Listing type */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>1. What are you listing?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LISTING_TYPES.map(lt => (
                <button key={lt.value} type="button" onClick={() => { update('type', lt.value); update('subcategory', ''); }} style={{
                  padding: '14px 18px', borderRadius: 10, border: `2px solid ${form.type === lt.value ? 'var(--green-primary)' : 'var(--gray-200)'}`,
                  background: form.type === lt.value ? 'var(--green-pale)' : '#fff',
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <span style={{ fontSize: 22 }}>{lt.label.split(' ')[0]}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: form.type === lt.value ? 'var(--green-primary)' : 'var(--gray-900)' }}>{lt.label.split(' ').slice(1).join(' ')}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{lt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            {errors.type && <p style={{ fontSize: 12, color: 'var(--red-alert)', marginTop: 8 }}>{errors.type}</p>}
          </div>

          {/* Basic Info */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>2. Listing Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {subcats?.length > 0 && (
                <Select label="Subcategory" value={form.subcategory} onChange={e => update('subcategory', e.target.value)}
                  options={subcats} placeholder="Select type..." />
              )}
              <Input label="Title *" placeholder="e.g. Fresh Eggs — 3 trays daily" value={form.title}
                onChange={e => update('title', e.target.value)} error={errors.title} />
              <Textarea label="Description *" placeholder="Describe your product/service — quality, how to access, any conditions..."
                value={form.description} onChange={e => update('description', e.target.value)} error={errors.description} style={{ minHeight: 110 }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <Input label="Price (KES)" type="number" placeholder="0 = Negotiable"
                  value={form.price} onChange={e => update('price', e.target.value)} />
                <Select label="Unit" value={form.unit} onChange={e => update('unit', e.target.value)}
                  options={UNIT_OPTIONS} placeholder="Select unit" />
                <Input label="Quantity Available" type="number" placeholder="e.g. 3"
                  value={form.quantity} onChange={e => update('quantity', e.target.value)} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="delivery" checked={form.delivery_available}
                  onChange={e => update('delivery_available', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <label htmlFor="delivery" style={{ fontSize: 14, color: 'var(--gray-700)', cursor: 'pointer' }}>
                  🚗 Delivery available (buyer pays transport)
                </label>
              </div>
            </div>
          </div>

          {/* Image */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>3. Add a Photo (Optional)</h3>
            <div style={{
              border: '2px dashed var(--gray-200)', borderRadius: 12, padding: 24,
              textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
              background: imagePreview ? 'none' : 'var(--gray-100)',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green-light)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
            >
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="preview" style={{ maxHeight: 200, borderRadius: 8, maxWidth: '100%' }} />
                  <button type="button" onClick={() => { setImagePreview(''); update('image_url', ''); }} style={{
                    position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--red-alert)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}>×</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                  <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 8 }}>Click to upload a photo of your product</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>PNG, JPG up to 5MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="img-upload" />
              <button type="button" onClick={() => fileRef.current.click()} style={{
                marginTop: 12, padding: '10px 24px', borderRadius: 8, border: 'none',
                background: '#8e44ad', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>📁 Choose Photo</button>
              
            </div>
            {uploading && <p style={{ fontSize: 12, color: 'var(--green-primary)', marginTop: 8 }}>⏳ Uploading photo…</p>}
          </div>

          {/* Location */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>4. Pin Your Location *</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
              This helps buyers know exactly where to find you or estimate delivery distance.
            </p>
            <Input label="Location Name" placeholder="e.g. Community Smart Village, near the chief's camp" value={form.location_name}
              onChange={e => update('location_name', e.target.value)} style={{ marginBottom: 14 }} />
            <MapPicker
              value={form.location_lat ? { lat: form.location_lat, lng: form.location_lng } : null}
              onChange={coords => { update('location_lat', coords.lat); update('location_lng', coords.lng); }}
              height={280}
            />
            {errors.location && <p style={{ fontSize: 12, color: 'var(--red-alert)', marginTop: 8 }}>{errors.location}</p>}
          </div>

          {/* Contact */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>5. Contact Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Phone Number *" type="tel" placeholder="e.g. 0712 345 678" icon="📞"
                value={form.phone} onChange={e => update('phone', e.target.value)} error={errors.phone} />
              <Input label="WhatsApp Number" type="tel" placeholder="Leave blank if same as phone" icon="💬"
                value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} />
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            🚀 Post Listing to Community Smart
          </Button>
        </form>
      </div>
    </div>
  );
}
