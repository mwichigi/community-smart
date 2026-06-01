import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getInitials } from '../../utils/helpers';

export default function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [location]);

  const navLinks = [
    { to: '/marketplace', label: 'Marketplace', icon: '🌽' },
    { to: '/housing', label: 'Housing', icon: '🏠' },
    { to: '/services', label: 'Services', icon: '🔧' },
    { to: '/ai-assistant', label: 'AI Farming', icon: '🤖' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(15,61,31,0.97)' : 'rgba(15,61,31,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid rgba(76,175,114,0.3)' : 'none',
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.2)' : 'none',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 64 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4caf72, #d4a017)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>M</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: 1 }}>Community Smart</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Market</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 32, flex: 1 }} className="nav-links-desktop">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              color: location.pathname.startsWith(link.to) ? '#4caf72' : 'rgba(255,255,255,0.8)',
              background: location.pathname.startsWith(link.to) ? 'rgba(76,175,114,0.15)' : 'transparent',
              fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!location.pathname.startsWith(link.to)) e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (!location.pathname.startsWith(link.to)) e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          {user ? (
            <>
              <Link to="/post-listing" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 8,
                background: 'linear-gradient(135deg, #4caf72, #2d7a47)',
                color: '#fff', fontSize: 13, fontWeight: 600,
                boxShadow: '0 2px 8px rgba(76,175,114,0.4)',
              }}>
                + Post
              </Link>
              <Link to="/messages" style={{ color: 'rgba(255,255,255,0.8)', padding: 8, fontSize: 18 }}>💬</Link>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d4a017, #c4956a)',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                >{getInitials(user.name)}</button>
                {profileOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 44, width: 200,
                    background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    overflow: 'hidden', zIndex: 100,
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-900)' }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'capitalize' }}>{user.user_type}</div>
                    </div>
                    {[
                      { to: '/profile', label: '👤 My Profile' },
                      { to: '/my-listings', label: '📋 My Listings' },
                      { to: '/messages', label: '💬 Messages' },
                    ].map(item => (
                      <Link key={item.to} to={item.to} style={{
                        display: 'block', padding: '10px 16px', fontSize: 14,
                        color: 'var(--gray-700)', transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >{item.label}</Link>
                    ))}
                    <button onClick={() => { logout(); navigate('/'); }} style={{
                      width: '100%', padding: '10px 16px', textAlign: 'left',
                      fontSize: 14, color: 'var(--red-alert)', background: 'transparent',
                      borderTop: '1px solid var(--gray-100)',
                    }}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, padding: '7px 14px', fontWeight: 500 }}>Login</Link>
              <Link to="/register" style={{
                padding: '7px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: 'linear-gradient(135deg, #4caf72, #2d7a47)',
                color: '#fff', boxShadow: '0 2px 8px rgba(76,175,114,0.4)',
              }}>Register</Link>
            </>
          )}

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            display: 'none', color: '#fff', fontSize: 22, background: 'none', padding: 4,
          }} className="hamburger">☰</button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(10,45,22,0.98)', padding: '12px 20px 20px',
          borderTop: '1px solid rgba(76,175,114,0.2)',
        }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 0', color: '#fff', fontSize: 15,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>{link.icon} {link.label}</Link>
          ))}
          {!user && (
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Link to="/login" style={{ flex: 1, textAlign: 'center', padding: '10px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff', fontSize: 14 }}>Login</Link>
              <Link to="/register" style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#4caf72', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600 }}>Register</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
