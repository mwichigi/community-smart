import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', loading, fullWidth, onClick, type = 'button', disabled, style }) {
  const sizes = { sm: '6px 14px', md: '10px 22px', lg: '13px 30px' };
  const fonts = { sm: 13, md: 14, lg: 16 };
  const variants = {
    primary: { background: 'linear-gradient(135deg, #4caf72, #1a5c2e)', color: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(76,175,114,0.35)' },
    secondary: { background: '#fff', color: 'var(--green-primary)', border: '1.5px solid var(--green-primary)' },
    danger: { background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: 'var(--green-primary)', border: 'none' },
    gold: { background: 'linear-gradient(135deg, #d4a017, #b8860b)', color: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(212,160,23,0.35)' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: sizes[size], fontSize: fonts[size], fontWeight: 600, borderRadius: 8,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1, transition: 'all 0.2s',
        width: fullWidth ? '100%' : 'auto', fontFamily: 'var(--font-body)',
        ...variants[variant], ...style,
      }}
    >
      {loading && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
      {children}
    </button>
  );
}

export function Input({ label, error, icon, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>{icon}</span>}
        <input
          {...props}
          style={{
            width: '100%', padding: icon ? '10px 14px 10px 40px' : '10px 14px',
            border: `1.5px solid ${error ? 'var(--red-alert)' : 'var(--gray-200)'}`,
            borderRadius: 8, fontSize: 14, background: '#fff', color: 'var(--gray-900)',
            transition: 'border-color 0.2s',
            ...props.style,
          }}
          onFocus={e => e.target.style.borderColor = error ? 'var(--red-alert)' : 'var(--green-light)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--red-alert)' : 'var(--gray-200)'}
        />
      </div>
      {error && <span style={{ fontSize: 12, color: 'var(--red-alert)' }}>{error}</span>}
    </div>
  );
}

export function Select({ label, error, options, placeholder, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>{label}</label>}
      <select
        {...props}
        style={{
          width: '100%', padding: '10px 14px', border: `1.5px solid ${error ? 'var(--red-alert)' : 'var(--gray-200)'}`,
          borderRadius: 8, fontSize: 14, background: '#fff', color: 'var(--gray-900)',
          appearance: 'none', cursor: 'pointer',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237a8c75' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options?.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
      {error && <span style={{ fontSize: 12, color: 'var(--red-alert)' }}>{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>{label}</label>}
      <textarea
        {...props}
        style={{
          width: '100%', padding: '10px 14px', border: `1.5px solid ${error ? 'var(--red-alert)' : 'var(--gray-200)'}`,
          borderRadius: 8, fontSize: 14, background: '#fff', color: 'var(--gray-900)',
          resize: 'vertical', minHeight: 100,
          ...props.style,
        }}
        onFocus={e => e.target.style.borderColor = error ? 'var(--red-alert)' : 'var(--green-light)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--red-alert)' : 'var(--gray-200)'}
      />
      {error && <span style={{ fontSize: 12, color: 'var(--red-alert)' }}>{error}</span>}
    </div>
  );
}

export function Badge({ children, color = 'green' }) {
  const colors = {
    green: { bg: 'var(--green-pale)', text: 'var(--green-primary)' },
    gold: { bg: '#fef9e7', text: '#b8860b' },
    blue: { bg: 'var(--sky-light)', text: 'var(--sky)' },
    red: { bg: 'var(--red-pale)', text: 'var(--red-alert)' },
    earth: { bg: '#fdf3e8', text: 'var(--earth-mid)' },
  };
  const c = colors[color] || colors.green;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      background: c.bg, color: c.text,
    }}>{children}</span>
  );
}

export function Card({ children, hover = true, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--gray-200)', overflow: 'hidden',
        transition: hover ? 'all 0.25s ease' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={e => { if (hover) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; } }}
      onMouseLeave={e => { if (hover) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; } }}
    >
      {children}
    </div>
  );
}

export function Spinner({ size = 24, color = 'var(--green-primary)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `3px solid ${color}30`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--gray-700)', marginBottom: 8 }}>{title}</h3>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>{subtitle}</p>
      {action}
    </div>
  );
}

export function ContactBar({ phone, whatsapp, onChat, listingTitle }) {
  const waLink = `https://wa.me/${(whatsapp || phone)?.replace(/\D/g, '')?.replace(/^0/, '254')}?text=${encodeURIComponent(`Hi, I saw your listing "${listingTitle}" on Community Smart and I'm interested.`)}`;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {phone && (
        <a href={`tel:${phone}`} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: 'var(--green-pale)', color: 'var(--green-primary)',
          border: '1.5px solid var(--green-light)',
        }}>📞 Call</a>
      )}
      {(whatsapp || phone) && (
        <a href={waLink} target="_blank" rel="noreferrer" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: '#e8f8ef', color: '#25d366', border: '1.5px solid #25d366',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.532 5.865L.054 23.389l5.637-1.479A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.778 9.778 0 01-4.964-1.352l-.356-.212-3.348.879.893-3.267-.232-.374A9.778 9.778 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818 5.421 0 9.818 4.397 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z"/></svg>
          WhatsApp
        </a>
      )}
      {onChat && (
        <button onClick={onChat} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: 'var(--sky-light)', color: 'var(--sky)', border: '1.5px solid var(--sky)',
        }}>💬 Chat</button>
      )}
    </div>
  );
}
