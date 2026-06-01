import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const STATS = [
  { number: '500+', label: 'Active Farmers' },
  { number: '1,200+', label: 'Listings Posted' },
  { number: '50+', label: 'Service Providers' },
  { number: '12', label: 'Villages Covered' },
];

const FEATURES = [
  {
    icon: '🌽', title: 'Farm Produce Market',
    desc: 'Buy and sell eggs, milk, maize, beans, potatoes, peas and more — directly from the farm.',
    color: '#1a5c2e', bg: '#e8f5ec',
    link: '/marketplace',
  },
  {
    icon: '🏠', title: 'Housing & Rentals',
    desc: 'Landlords list rooms and houses. Tenants browse, view location maps, and chat directly.',
    color: '#b8860b', bg: '#fef9e7',
    link: '/housing',
  },
  {
    icon: '🌿', title: 'Agrovet & Vet Services',
    desc: 'Find fertilizers, animal feeds, pesticides and veterinary services near you.',
    color: '#1a7ab5', bg: '#e8f4fd',
    link: '/services',
  },
  {
    icon: '🤖', title: 'AI Crop Doctor',
    desc: 'Take a photo of a sick crop — potato blight, maize disease — and get instant AI diagnosis and treatment advice.',
    color: '#8e44ad', bg: '#f5eef8',
    link: '/ai-assistant',
  },
  {
    icon: '📍', title: 'Location-Based Matching',
    desc: 'Every listing is pinned on a map. Buyers can see exactly where to go or arrange delivery.',
    color: '#c0392b', bg: '#fdf0ef',
    link: '/marketplace',
  },
  {
    icon: '💬', title: 'Direct Communication',
    desc: 'Call, WhatsApp, or chat in-app. No middlemen. Seller and buyer connect directly.',
    color: '#25d366', bg: '#e8f8ef',
    link: '/marketplace',
  },
];

const CATEGORIES = [
  { icon: '🥚', label: 'Eggs', sub: 'Fresh daily' },
  { icon: '🥛', label: 'Milk', sub: 'Raw & pasteurised' },
  { icon: '🥔', label: 'Irish Potato', sub: 'Waru' },
  { icon: '🌽', label: 'Maize', sub: 'Green & dry' },
  { icon: '🫘', label: 'Beans', sub: 'Various types' },
  { icon: '🟢', label: 'Peas (Minji)', sub: 'Fresh & dry' },
  { icon: '🥬', label: 'Vegetables', sub: 'Kales, spinach…' },
  { icon: '🐔', label: 'Poultry', sub: 'Broilers & layers' },
];

export default function Home() {
  const { user } = useApp();
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handler = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      hero.style.backgroundPosition = `${50 + x * 0.3}% ${50 + y * 0.3}%`;
    };
    hero.addEventListener('mousemove', handler);
    return () => hero.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div style={{ paddingTop: 64 }}>

      {/* Hero */}
      <section ref={heroRef} style={{
        minHeight: '88vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(155deg, #0a2414 0%, #0f3d1f 30%, #1a5c2e 65%, #2d7a47 100%)',
        position: 'relative', overflow: 'hidden',
        transition: 'background-position 0.1s ease',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(76,175,114,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'rgba(212,160,23,0.07)' }} />
        <div style={{ position: 'absolute', top: '30%', right: '15%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(76,175,114,0.05)' }} />

        {/* Floating emojis */}
        {['🌽', '🥚', '🏠', '🌿', '🥛', '🌾'].map((e, i) => (
          <div key={i} style={{
            position: 'absolute', fontSize: 28, opacity: 0.15,
            top: `${15 + i * 13}%`, left: `${5 + i * 15}%`,
            animation: `pulse ${2 + i * 0.4}s ease-in-out infinite`,
          }}>{e}</div>
        ))}

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '80px 20px' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
              background: 'rgba(76,175,114,0.2)', borderRadius: 20, marginBottom: 24,
              border: '1px solid rgba(76,175,114,0.3)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf72', display: 'inline-block', animation: 'pulse 1.5s ease infinite' }} />
              <span style={{ color: '#4caf72', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em' }}>MAWINGU VILLAGE · NYANDARUA COUNTY</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 900,
              fontSize: 'clamp(38px, 6vw, 68px)', lineHeight: 1.08, marginBottom: 24,
            }}>
              Your Village.<br />
              <span style={{ background: 'linear-gradient(135deg, #4caf72, #d4a017)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                One Market.
              </span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 18, lineHeight: 1.75, marginBottom: 40, maxWidth: 560 }}>
              Connecting Community Smart farmers, buyers, agrovets, vets, and landlords on a single platform — with AI crop disease detection, map-based location, and direct WhatsApp contact.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to={user ? '/marketplace' : '/register'} style={{
                padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 700,
                background: 'linear-gradient(135deg, #4caf72, #2d7a47)',
                color: '#fff', boxShadow: '0 4px 20px rgba(76,175,114,0.45)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'inline-block',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(76,175,114,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(76,175,114,0.45)'; }}
              >
                {user ? 'Browse Marketplace' : 'Join Free'} →
              </Link>
              <Link to="/ai-assistant" style={{
                padding: '14px 28px', borderRadius: 10, fontSize: 16, fontWeight: 600,
                background: 'rgba(255,255,255,0.08)', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
                display: 'inline-block',
              }}>
                🤖 Try AI Crop Doctor
              </Link>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 900 0 720 20C540 40 240 0 0 20L0 60Z" fill="#fafdf7"/>
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: '#fff', padding: '0 20px', marginTop: -1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0, borderRadius: 16, overflow: 'hidden',
            boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-100)',
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                padding: '28px 24px', textAlign: 'center',
                borderRight: i < 3 ? '1px solid var(--gray-100)' : 'none',
                background: i % 2 === 0 ? '#fff' : 'var(--green-pale)',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--green-primary)', lineHeight: 1 }}>{s.number}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '72px 20px 48px', background: 'var(--off-white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 10 }}>What's Available Today</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>Fresh from Community Smart farms and suppliers</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.label} to={`/marketplace?category=${cat.label}`} style={{
                background: '#fff', borderRadius: 14, padding: '20px 12px', textAlign: 'center',
                border: '1.5px solid var(--gray-200)', transition: 'all 0.2s',
                display: 'block', textDecoration: 'none',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-light)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 34, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-900)', marginBottom: 4 }}>{cat.label}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{cat.sub}</div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link to="/marketplace" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '11px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: 'var(--green-primary)', color: '#fff',
            }}>Browse All Listings →</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 20px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 10 }}>Everything In One Place</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>Built specifically for Community Smart village's farming community and the businesses that serve it</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <Link key={f.title} to={f.link} style={{
                padding: '28px', borderRadius: 16, border: '1.5px solid var(--gray-100)',
                background: '#fff', transition: 'all 0.25s', display: 'block', textDecoration: 'none',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${f.color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-100)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 20px', textAlign: 'center',
        background: 'linear-gradient(135deg, var(--green-deep), var(--green-mid))',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 38, fontWeight: 900, marginBottom: 16 }}>Ready to Join Community Smart?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Whether you're selling eggs, looking for a house, or need a vet — your community is already here.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '14px 36px', borderRadius: 10, fontSize: 16, fontWeight: 700, background: '#fff', color: 'var(--green-primary)' }}>
              Create Free Account
            </Link>
            <Link to="/marketplace" style={{ padding: '14px 30px', borderRadius: 10, fontSize: 16, fontWeight: 600, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)' }}>
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--green-deep)', padding: '40px 20px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Community Smart</div>
        <p style={{ fontSize: 13, marginBottom: 16 }}>Connecting Community Smart Village · Nyandarua County · Kenya</p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13 }}>
          {['Marketplace', 'Housing', 'Services', 'AI Assistant'].map(l => (
            <Link key={l} to={`/${l.toLowerCase().replace(' ', '-')}`} style={{ color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >{l}</Link>
          ))}
        </div>
        <p style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2025 Community Smart. Built by Joseph Mwichigi with ❤️ for the community.</p>
        
        {/* Social Media Icons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          {/* WhatsApp */}
          <a href="https://wa.me/254700000000" target="_blank" rel="noreferrer" title="WhatsApp"
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
          </a>

          {/* Instagram */}
          <a href="https://instagram.com/your_username" target="_blank" rel="noreferrer" title="Instagram"
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>

          {/* TikTok */}
          <a href="https://tiktok.com/@your_username" target="_blank" rel="noreferrer" title="TikTok"
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
          </a>

          {/* LinkedIn */}
          <a href="https://linkedin.com/in/your_username" target="_blank" rel="noreferrer" title="LinkedIn"
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#0077b5', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>

          {/* GitHub */}
          <a href="https://github.com/your_username" target="_blank" rel="noreferrer" title="GitHub"
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#333333', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
        </div>
      </footer>

      <style>{`
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
