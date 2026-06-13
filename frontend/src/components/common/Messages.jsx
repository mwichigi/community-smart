import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { messagesAPI } from '../../utils/api';
import { formatDate, getInitials } from '../../utils/helpers';
import { Spinner, Input, Button } from '../common/UI';

const DEMO_CONVERSATIONS = [
  { id: 1, other_user: { id: 2, name: 'Peter Kamau', user_type: 'farmer' }, last_message: { text: 'Yes the potatoes are still available, come tomorrow morning', created_at: new Date(Date.now() - 3600000).toISOString() }, unread: 1 },
  { id: 2, other_user: { id: 3, name: 'James Kariuki', user_type: 'landlord' }, last_message: { text: 'The bedsitter is available from 1st. You can view on Saturday.', created_at: new Date(Date.now() - 86400000).toISOString() }, unread: 0 },
];

const DEMO_MESSAGES = [
  { id: 1, sender_id: 2, text: 'Hello, I saw your potato listing on Community Smart', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 2, sender_id: 1, text: 'Yes! I have 15 bags available, grade A. KES 2800 per bag.', created_at: new Date(Date.now() - 7100000).toISOString() },
  { id: 3, sender_id: 2, text: 'Can you deliver to Ol Kalou?', created_at: new Date(Date.now() - 7000000).toISOString() },
  { id: 4, sender_id: 1, text: 'Yes I can arrange delivery. Buyer pays transport — usually KES 200 per bag.', created_at: new Date(Date.now() - 6900000).toISOString() },
  { id: 5, sender_id: 2, text: 'Yes the potatoes are still available, come tomorrow morning', created_at: new Date(Date.now() - 3600000).toISOString() },
];

export default function Messages() {
  const { user } = useApp();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    messagesAPI.getConversations()
      .then(res => setConversations(res.conversations || res))
      .catch(() => setConversations(DEMO_CONVERSATIONS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    messagesAPI.getMessages(activeConv.other_user.id)
      .then(res => setMessages(res.messages || res))
      .catch(() => setMessages(DEMO_MESSAGES));
  }, [activeConv]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      messagesAPI.getMessages(activeConv.other_user.id)
        .then(res => setMessages(res.messages || res))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    const msg = { id: Date.now(), sender_id: user?.id || 1, text: newMsg, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    setNewMsg('');
    try { await messagesAPI.sendMessage({ to: activeConv.other_user.id, text: newMsg }); } catch { }
    setSending(false);
  };

  if (!user) return (
    <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Login to view messages</h2>
      <a href="/login" style={{ padding: '10px 24px', background: 'var(--green-primary)', color: '#fff', borderRadius: 8, fontWeight: 600 }}>Sign In</a>
    </div>
  );

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--off-white)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px', height: 'calc(100vh - 64px)', display: 'flex', gap: 20 }}>

        {/* Conversations list */}
        <div style={{ width: 300, flexShrink: 0, background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--gray-100)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>💬 Messages</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)', fontSize: 14 }}>No conversations yet</div>
            ) : conversations.map(conv => (
              <div key={conv.id} onClick={() => setActiveConv(conv)} style={{
                padding: '14px 18px', cursor: 'pointer', borderBottom: '1px solid var(--gray-100)',
                background: activeConv?.id === conv.id ? 'var(--green-pale)' : '#fff',
                transition: 'background 0.15s',
                borderLeft: conv.unread > 0 ? '3px solid var(--green-primary)' : '3px solid transparent',
              }}
                onMouseEnter={e => { if (activeConv?.id !== conv.id) e.currentTarget.style.background = 'var(--gray-100)'; }}
                onMouseLeave={e => { if (activeConv?.id !== conv.id) e.currentTarget.style.background = '#fff'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {getInitials(conv.other_user.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: conv.unread > 0 ? 700 : 600, fontSize: 14, color: 'var(--gray-900)' }}>{conv.other_user.name}</span>
                      {conv.unread > 0 && <span style={{ background: 'var(--green-primary)', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{conv.unread}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--gray-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{conv.last_message?.text}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{formatDate(conv.last_message?.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeConv ? (
            <>
              {/* Chat header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {getInitials(activeConv.other_user.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{activeConv.other_user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'capitalize' }}>{activeConv.other_user.user_type}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map(msg => {
                  const isMe = msg.sender_id === (user?.id || 1);
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '72%', padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? 'var(--green-primary)' : 'var(--gray-100)',
                        color: isMe ? '#fff' : 'var(--gray-900)',
                        fontSize: 14, lineHeight: 1.5,
                      }}>
                        <p>{msg.text}</p>
                        <p style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>{formatDate(msg.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '14px 16px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 10 }}>
                <input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message…"
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: '1.5px solid var(--gray-200)', fontSize: 14, background: 'var(--gray-100)' }}
                />
                <button onClick={sendMessage} disabled={sending || !newMsg.trim()} style={{
                  width: 44, height: 44, borderRadius: '50%', border: 'none',
                  background: newMsg.trim() ? 'var(--green-primary)' : 'var(--gray-200)',
                  color: '#fff', fontSize: 18, cursor: newMsg.trim() ? 'pointer' : 'not-allowed', flexShrink: 0,
                }}>→</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--gray-400)' }}>
              <div style={{ fontSize: 52 }}>💬</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Select a conversation</p>
              <p style={{ fontSize: 13 }}>Click any conversation on the left to chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
