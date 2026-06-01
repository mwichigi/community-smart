import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, USER_TYPES, USER_TYPE_LABELS } from '../../context/AppContext';
import { authAPI } from '../../utils/api';
import { Button, Input, Select } from '../common/UI';

const USER_TYPE_ICONS = {
  farmer: '🌾', buyer: '🛒', retailer: '🏪', wholesaler: '🏭',
  agrovet: '🌿', vet: '💉', landlord: '🏠', general: '👤',
};

export default function Register() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', whatsapp: '', password: '', confirm_password: '', user_type: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const update = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: '' })); };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.phone) e.phone = 'Phone number is required';
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.user_type) e.user_type = 'Please select your account type';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    return e;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerError('');
    try {
      const res = await authAPI.register(form);
      login(res.user, res.token);
      navigate('/marketplace');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off-white)', padding: '80px 20px 40px' }}>
      <div style={{ width: '100%', maxWidth: 520, animation: 'fadeIn 0.4s ease' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #4caf72, #d4a017)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>M</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--green-deep)' }}>Community Smart</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>Create Account</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Already have an account? <Link to="/login" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>Sign in</Link></p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
          {[1, 2].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13,
                  background: step >= s ? 'var(--green-primary)' : 'var(--gray-200)',
                  color: step >= s ? '#fff' : 'var(--gray-500)',
                }}>{s}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: step >= s ? 'var(--green-primary)' : 'var(--gray-500)' }}>
                  {s === 1 ? 'Personal Info' : 'Account Type'}
                </span>
              </div>
              {i === 0 && <div style={{ flex: 1, height: 2, background: step > 1 ? 'var(--green-primary)' : 'var(--gray-200)', margin: '0 12px' }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--shadow-md)', padding: '36px 40px' }}>
          {serverError && (
            <div style={{ padding: '12px 16px', background: 'var(--red-pale)', borderRadius: 8, color: 'var(--red-alert)', fontSize: 14, marginBottom: 24 }}>
              ⚠️ {serverError}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Input label="Full Name" placeholder="e.g. Jane Wanjiru" icon="👤"
                value={form.name} onChange={e => update('name', e.target.value)} error={errors.name} />
              <Input label="Email Address" type="email" placeholder="you@example.com" icon="📧"
                value={form.email} onChange={e => update('email', e.target.value)} error={errors.email} />
              <Input label="Phone Number" type="tel" placeholder="e.g. 0712 345 678" icon="📱"
                value={form.phone} onChange={e => update('phone', e.target.value)} error={errors.phone} />
              <Input label="WhatsApp Number (optional)" type="tel" placeholder="Same as phone or different"
                icon="💬" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} />
              <Button fullWidth size="lg" onClick={handleNext}>Continue →</Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 10 }}>I am a... *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {Object.entries(USER_TYPE_LABELS).map(([value, label]) => (
                    <button key={value} type="button" onClick={() => update('user_type', value)} style={{
                      padding: '12px 14px', borderRadius: 10, border: `2px solid ${form.user_type === value ? 'var(--green-primary)' : 'var(--gray-200)'}`,
                      background: form.user_type === value ? 'var(--green-pale)' : '#fff',
                      color: form.user_type === value ? 'var(--green-primary)' : 'var(--gray-700)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                    }}>
                      <span style={{ fontSize: 18 }}>{USER_TYPE_ICONS[value]}</span>
                      {label}
                    </button>
                  ))}
                </div>
                {errors.user_type && <p style={{ fontSize: 12, color: 'var(--red-alert)', marginTop: 6 }}>{errors.user_type}</p>}
              </div>

              <Input label="Password" type="password" placeholder="At least 6 characters" icon="🔒"
                value={form.password} onChange={e => update('password', e.target.value)} error={errors.password} />
              <Input label="Confirm Password" type="password" placeholder="Re-enter password" icon="🔒"
                value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} error={errors.confirm_password} />

              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</Button>
                <Button type="submit" loading={loading} style={{ flex: 2 }} size="lg">Create Account 🎉</Button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-500)', marginTop: 20 }}>
          By registering, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
