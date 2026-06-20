import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { formatDate, formatPrice } from '../utils/helpers';
import { Spinner } from '../components/common/UI';

const TABS = ['Overview', 'Listings', 'Sold', 'Users', 'Logs'];

export default function Admin() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState([]);
  const [sold, setSold] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logAction, setLogAction] = useState('');
  const [logUser, setLogUser] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.email !== 'ngangamj828@gmail.com') { navigate('/'); return; }
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (tab === 'Listings') fetchListings();
    if (tab === 'Users') fetchUsers();
    if (tab === 'Logs') fetchLogs();
    if (tab === 'Sold') fetchSold();
    if (tab === 'Logs') fetchLogs();
  }, [tab, search, page, category]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res);
    } catch { } finally { setLoading(false); }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/listings', { params: { search, category, page, limit: 15 } });
      setListings(res.listings || []);
      setTotal(res.total || 0);
    } catch { } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { search, page, limit: 15 } });
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch { } finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs', { params: { page, limit: 50, action: logAction, user: logUser } });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch { } finally { setLoading(false); }
  };
  const fetchSold = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/sold-listings', { params: { page, limit: 15 } });
      setSold(res.listings || []);
      setTotal(res.total || 0);
    } catch { } finally { setLoading(false); }
  };
  const deleteSoldAll = async () => {
    if (!window.confirm('Delete ALL sold listings permanently?')) return;
    await api.delete('/admin/sold-listings');
    fetchSold();
  };
  const markSold = async (id) => {
    await api.put(`/admin/listings/${id}/mark-sold`);
    fetchListings();
  };
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs', { params: { page, limit: 30 } });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch { } finally { setLoading(false); }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    await api.delete(`/admin/listings/${id}`);
    fetchListings();
  };

  const toggleListing = async (id) => {
    await api.put(`/admin/listings/${id}/toggle`);
    fetchListings();
  };

  const toggleUser = async (id) => {
    await api.put(`/admin/users/${id}/toggle`);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their data?')) return;
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  if (loading && !stats) return <div style={{ paddingTop: 100, display: 'flex', justifyContent: 'center' }}><Spinner size={40} /></div>;

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#0f1117' }}>
      <div style={{ background: '#1a1d2e', borderBottom: '1px solid #2d3748', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>🛡️ Admin Panel</h1>
          <p style={{ color: '#718096', fontSize: 13, marginTop: 2 }}>Community Smart — Nyandarua County</p>
        </div>
        <div style={{ background: '#2d3748', padding: '8px 16px', borderRadius: 8, color: '#68d391', fontSize: 13, fontWeight: 600 }}>🟢 Live</div>
      </div>

      <div style={{ background: '#1a1d2e', borderBottom: '1px solid #2d3748', padding: '0 28px', display: 'flex', gap: 4 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); setSearch(''); }} style={{
            padding: '14px 20px', border: 'none', background: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            color: tab === t ? '#68d391' : '#718096',
            borderBottom: tab === t ? '2px solid #68d391' : '2px solid transparent',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>
        {tab === 'Overview' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'Total Users', value: stats.stats.totalUsers, icon: '👥', color: '#667eea' },
                { label: 'Active Listings', value: stats.stats.totalListings, icon: '🌽', color: '#68d391' },
                { label: 'Messages Sent', value: stats.stats.totalMessages, icon: '💬', color: '#f6ad55' },
                { label: 'Housing Listed', value: stats.stats.totalHousing, icon: '🏠', color: '#fc8181' },
                { label: 'Services Listed', value: stats.stats.totalServices, icon: '🔧', color: '#76e4f7' },
                { label: 'New Today', value: stats.stats.newUsersToday, icon: '🆕', color: '#b794f4' },
              ].map(s => (
                <div key={s.label} style={{ background: '#1a1d2e', borderRadius: 12, padding: '20px', border: '1px solid #2d3748' }}>
                  <div style={{ fontSize: 28 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 8 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
              <div style={{ background: '#1a1d2e', borderRadius: 12, padding: 20, border: '1px solid #2d3748' }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📊 Listings by Category</h3>
                {stats.categoryStats.map(c => (
                  <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2d3748' }}>
                    <span style={{ color: '#a0aec0', fontSize: 14, textTransform: 'capitalize' }}>{c.category}</span>
                    <span style={{ color: '#68d391', fontWeight: 700, fontSize: 14 }}>{c.count}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#1a1d2e', borderRadius: 12, padding: 20, border: '1px solid #2d3748' }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🆕 Recent Registrations</h3>
                {stats.recentUsers.map(u => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2d3748' }}>
                    <div>
                      <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: '#718096', fontSize: 11 }}>{u.user_type}</div>
                    </div>
                    <span style={{ color: '#718096', fontSize: 11 }}>{formatDate(u.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#1a1d2e', borderRadius: 12, padding: 20, border: '1px solid #2d3748' }}>
              <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📈 Registrations (Last 30 Days)</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
                {stats.registrationsPerDay.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', background: '#68d391', borderRadius: '3px 3px 0 0', height: `${Math.max(4, d.count * 20)}px` }} title={`${d.date}: ${d.count} users`} />
                  </div>
                ))}
              </div>
              <div style={{ color: '#718096', fontSize: 11, marginTop: 8, textAlign: 'center' }}>Each bar = 1 day</div>
            </div>
          </div>
        )}

        {tab === 'Listings' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search listings..." style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8, border: '1px solid #2d3748', background: '#1a1d2e', color: '#fff', fontSize: 14 }} />
              <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2d3748', background: '#1a1d2e', color: '#fff', fontSize: 14 }}>
                <option value="">All Categories</option>
                <option value="produce">Farm Produce</option>
                <option value="agrovet">Agrovet</option>
                <option value="services">Services</option>
              </select>
            </div>
            <div style={{ background: '#1a1d2e', borderRadius: 12, border: '1px solid #2d3748', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', padding: '12px 16px', borderBottom: '1px solid #2d3748', background: '#2d3748' }}>
                {['Title', 'Seller', 'Price', 'Category', 'Status', 'Actions'].map(h => (
                  <div key={h} style={{ color: '#a0aec0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div> :
                listings.map(l => (
                  <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', padding: '12px 16px', borderBottom: '1px solid #2d3748', alignItems: 'center' }}>
                    <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{l.title}</div>
                    <div style={{ color: '#a0aec0', fontSize: 12 }}>{l.seller_name}</div>
                    <div style={{ color: '#68d391', fontSize: 12 }}>{formatPrice(l.price)}</div>
                    <div style={{ color: '#a0aec0', fontSize: 12, textTransform: 'capitalize' }}>{l.category}</div>
                    <div><span style={{ background: l.is_active ? '#22543d' : '#742a2a', color: l.is_active ? '#68d391' : '#fc8181', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{l.is_active ? 'Active' : 'Hidden'}</span></div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => toggleListing(l.id)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#2d3748', color: '#a0aec0', fontSize: 11, cursor: 'pointer' }}>{l.is_active ? '🙈 Hide' : '👁 Show'}</button>
                      <button onClick={() => markSold(l.id)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#744210', color: '#f6ad55', fontSize: 11, cursor: 'pointer' }}>✅ Sold</button>
                      <button onClick={() => deleteListing(l.id)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#742a2a', color: '#fc8181', fontSize: 11, cursor: 'pointer' }}>🗑 Delete</button>
                    </div>
                  </div>
                ))
              }
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span style={{ color: '#718096', fontSize: 13 }}>{total} listings total</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2d3748', color: '#a0aec0', cursor: 'pointer' }}>← Prev</button>
                <span style={{ padding: '8px 16px', color: '#718096' }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2d3748', color: '#a0aec0', cursor: 'pointer' }}>Next →</button>
              </div>
            </div>
          </div>
        )}


        {tab === 'Sold' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>🏷️ Sold Listings ({total})</h3>
              <button onClick={deleteSoldAll} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#742a2a', color: '#fc8181', fontWeight: 700, cursor: 'pointer' }}>🗑 Delete All Sold</button>
            </div>
            <div style={{ background: '#1a1d2e', borderRadius: 12, border: '1px solid #2d3748', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '12px 16px', borderBottom: '1px solid #2d3748', background: '#2d3748' }}>
                {['Title', 'Seller', 'Price', 'Sold At', 'Actions'].map(h => (
                  <div key={h} style={{ color: '#a0aec0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div> :
                sold.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#718096' }}>No sold listings yet.</div> :
                sold.map(l => (
                  <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '12px 16px', borderBottom: '1px solid #2d3748', alignItems: 'center' }}>
                    <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{l.title}</div>
                    <div style={{ color: '#a0aec0', fontSize: 12 }}>{l.seller_name}</div>
                    <div style={{ color: '#68d391', fontSize: 12 }}>{formatPrice(l.price)}</div>
                    <div style={{ color: '#718096', fontSize: 11 }}>{formatDate(l.sold_at)}</div>
                    <button onClick={() => deleteListing(l.id)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#742a2a', color: '#fc8181', fontSize: 11, cursor: 'pointer' }}>🗑 Delete</button>
                  </div>
                ))
              }
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span style={{ color: '#718096', fontSize: 13 }}>{total} sold listings total</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2d3748', color: '#a0aec0', cursor: 'pointer' }}>← Prev</button>
                <span style={{ padding: '8px 16px', color: '#718096' }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2d3748', color: '#a0aec0', cursor: 'pointer' }}>Next →</button>
              </div>
            </div>
          </div>
        )}
        {tab === 'Users' && (
          <div>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." style={{ width: '100%', marginBottom: 20, padding: '10px 14px', borderRadius: 8, border: '1px solid #2d3748', background: '#1a1d2e', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
            <div style={{ background: '#1a1d2e', borderRadius: 12, border: '1px solid #2d3748', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr auto', padding: '12px 16px', borderBottom: '1px solid #2d3748', background: '#2d3748' }}>
                {['Name', 'Email', 'Type', 'Listings', 'Messages', 'Joined', 'Actions'].map(h => (
                  <div key={h} style={{ color: '#a0aec0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div> :
                users.map(u => (
                  <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr auto', padding: '12px 16px', borderBottom: '1px solid #2d3748', alignItems: 'center' }}>
                    <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ color: '#a0aec0', fontSize: 12 }}>{u.email}</div>
                    <div style={{ color: '#a0aec0', fontSize: 12, textTransform: 'capitalize' }}>{u.user_type}</div>
                    <div style={{ color: '#68d391', fontSize: 12 }}>{u.listing_count}</div>
                    <div style={{ color: '#f6ad55', fontSize: 12 }}>{u.message_count}</div>
                    <div style={{ color: '#718096', fontSize: 11 }}>{formatDate(u.created_at)}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => toggleUser(u.id)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#2d3748', color: '#a0aec0', fontSize: 11, cursor: 'pointer' }}>{u.is_active ? '🔒 Ban' : '✅ Unban'}</button>
                      <button onClick={() => deleteUser(u.id)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#742a2a', color: '#fc8181', fontSize: 11, cursor: 'pointer' }}>🗑</button>
                    </div>
                  </div>
                ))
              }
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span style={{ color: '#718096', fontSize: 13 }}>{total} users total</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2d3748', color: '#a0aec0', cursor: 'pointer' }}>← Prev</button>
                <span style={{ padding: '8px 16px', color: '#718096' }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2d3748', color: '#a0aec0', cursor: 'pointer' }}>Next →</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'Logs' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input value={logUser} onChange={e => { setLogUser(e.target.value); setPage(1); }} placeholder="Search by user..." style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8, border: '1px solid #2d3748', background: '#1a1d2e', color: '#fff', fontSize: 14 }} />
              <select value={logAction} onChange={e => { setLogAction(e.target.value); setPage(1); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2d3748', background: '#1a1d2e', color: '#fff', fontSize: 14 }}>
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="register">Register</option>
                <option value="create_listing">Create Listing</option>
                <option value="update_listing">Update Listing</option>
                <option value="delete_listing">Delete Listing</option>
                <option value="mark_sold">Mark Sold</option>
                <option value="send_message">Send Message</option>
              </select>
            </div>
            <div style={{ background: '#1a1d2e', borderRadius: 12, border: '1px solid #2d3748', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr 1fr', padding: '12px 16px', borderBottom: '1px solid #2d3748', background: '#2d3748' }}>
                {['User', 'Action', 'Entity', 'Detail', 'Time'].map(h => (
                  <div key={h} style={{ color: '#a0aec0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div> :
                logs.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#718096' }}>No logs yet.</div> :
                logs.map(l => {
                  const actionColors = {
                    login: '#68d391', register: '#76e4f7', create_listing: '#b794f4',
                    update_listing: '#f6ad55', delete_listing: '#fc8181', mark_sold: '#f6ad55', send_message: '#667eea'
                  };
                  return (
                    <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr 1fr', padding: '10px 16px', borderBottom: '1px solid #2d3748', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600 }}>{l.user_name || 'Guest'}</div>
                        <div style={{ color: '#718096', fontSize: 10 }}>{l.ip}</div>
                      </div>
                      <div><span style={{ background: '#2d3748', color: actionColors[l.action] || '#a0aec0', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{l.action}</span></div>
                      <div style={{ color: '#a0aec0', fontSize: 12 }}>{l.entity ? `${l.entity} #${l.entity_id}` : '—'}</div>
                      <div style={{ color: '#718096', fontSize: 12 }}>{l.detail || '—'}</div>
                      <div style={{ color: '#718096', fontSize: 11 }}>{formatDate(l.created_at)}</div>
                    </div>
                  );
                })
              }
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span style={{ color: '#718096', fontSize: 13 }}>{total} log entries</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2d3748', color: '#a0aec0', cursor: 'pointer' }}>← Prev</button>
                <span style={{ padding: '8px 16px', color: '#718096' }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2d3748', color: '#a0aec0', cursor: 'pointer' }}>Next →</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'Logs' && (
          <div>
            <div style={{ background: '#1a1d2e', borderRadius: 12, border: '1px solid #2d3748', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr 1fr', padding: '12px 16px', borderBottom: '1px solid #2d3748', background: '#2d3748' }}>
                {['User', 'Action', 'Entity', 'Detail', 'Time'].map(h => (
                  <div key={h} style={{ color: '#a0aec0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div> :
                logs.map(l => (
                  <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr 1fr', padding: '10px 16px', borderBottom: '1px solid #2d3748', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600 }}>{l.user_name || 'Guest'}</div>
                      <div style={{ color: '#718096', fontSize: 10 }}>{l.user_email || l.ip}</div>
                    </div>
                    <div><span style={{ background: '#2d3748', color: '#68d391', padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>{l.action}</span></div>
                    <div style={{ color: '#a0aec0', fontSize: 12, textTransform: 'capitalize' }}>{l.entity || '-'}</div>
                    <div style={{ color: '#718096', fontSize: 11 }}>{l.detail || '-'}</div>
                    <div style={{ color: '#718096', fontSize: 11 }}>{formatDate(l.created_at)}</div>
                  </div>
                ))
              }
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span style={{ color: '#718096', fontSize: 13 }}>{total} logs total</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2d3748', color: '#a0aec0', cursor: 'pointer' }}>← Prev</button>
                <span style={{ padding: '8px 16px', color: '#718096' }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 30 >= total} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2d3748', color: '#a0aec0', cursor: 'pointer' }}>Next →</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 
