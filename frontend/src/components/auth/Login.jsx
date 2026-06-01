import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { authAPI } from '../../utils/api';
import { Button, Input } from '../common/UI';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerError('');
    try {
      const res = await authAPI.login(form);
      login(res.user, res.token);
      navigate('/marketplace');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--off-white)' }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 480px', background: 'linear-gradient(160deg, var(--green-deep) 0%, var(--green-mid) 60%, #1a7a3e 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px',
        position: 'relative', overflow: 'hidden',
      }} className="login-panel">
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(76,175,114,0.12)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(212,160,23,0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #4caf72, #d4a017)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>M</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', color: '#fff', fontWeight: 700, fontSize: 20 }}>Community Smart</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: '0.12em' }}>NYANDARUA COUNTY, KENYA</div>
            </div>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 38, fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}>
            Welcome<br />Back 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            Connect with farmers, buyers, and service providers across Community Smart village and beyond.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['🌽 Fresh farm produce daily', '🏠 Houses & rooms to let', '🤖 AI crop disease detection', '📍 Location-based matching'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4caf72', flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeIn 0.4s ease' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>Sign In</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 32 }}>Don't have an account? <Link to="/register" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>Register here</Link></p>

          {serverError && (
            <div style={{ padding: '12px 16px', background: 'var(--red-pale)', border: '1px solid #f5c6c2', borderRadius: 8, color: 'var(--red-alert)', fontSize: 14, marginBottom: 24 }}>
              ⚠️ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input label="Email Address" type="email" placeholder="you@example.com" icon="📧"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} error={errors.email} />
            <Input label="Password" type="password" placeholder="Your password" icon="🔒"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} error={errors.password} />

            <div style={{ textAlign: 'right' }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--green-primary)' }}>Forgot password?</Link>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">Sign In to Community Smart</Button>
          </form>

          <div style={{ marginTop: 32, padding: 16, background: 'var(--green-pale)', borderRadius: 10, border: '1px solid var(--gray-200)' }}>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center', marginBottom: 10, fontWeight: 600 }}>DEMO ACCOUNTS</p>
            {[
              { label: 'Farmer', email: 'farmer@demo.com', pw: 'demo123' },
              { label: 'Buyer', email: 'buyer@demo.com', pw: 'demo123' },
            ].map(d => (
              <button key={d.label} type="button" onClick={() => setForm({ email: d.email, password: d.pw })} style={{
                display: 'block', width: '100%', padding: '7px 12px', marginBottom: 6,
                background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 7,
                fontSize: 12, color: 'var(--gray-700)', cursor: 'pointer', textAlign: 'left',
              }}>
                <strong>{d.label}:</strong> {d.email} / {d.pw}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .login-panel { display: none !important; } }
      `}</style>
    </div>
  );
}
