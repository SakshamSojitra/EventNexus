import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiBell } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const inputS: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
  color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

export default function AdminNotifications() {
  const [notifs, setNotifs]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending]  = useState(false);
  const [form, setForm]        = useState({ title: '', message: '', target: 'all', type: 'info' });

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/notifications'); setNotifs(data); }
    catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const send = async () => {
    if (!form.title.trim() || !form.message.trim()) { toast.error('Title and message are required'); return; }
    setSending(true);
    try { await API.post('/admin/notifications', form); toast.success('Notification sent!'); setShowForm(false); setForm({ title: '', message: '', target: 'all', type: 'info' }); fetch(); }
    catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const TYPE_CFG: Record<string,{color:string;bg:string;emoji:string}> = {
    info:    { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',   emoji: 'ℹ️' },
    success: { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  emoji: '✅' },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  emoji: '⚠️' },
    error:   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   emoji: '🚨' },
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: '#a0a0b8' }}>{notifs.length} notifications sent</p>
        <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiSend size={13} /> Send Notification
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array(5).fill(0).map((_,i) => <div key={i} style={{ height: 76, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : notifs.length === 0 ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No notifications yet</div>
          <div style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 20 }}>Send your first notification to all users</div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ padding: '10px 20px' }}><FiSend size={13} /> Send Now</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifs.map((n, i) => {
            const cfg = TYPE_CFG[n.type] ?? TYPE_CFG.info;
            return (
              <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{cfg.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{n.title}</div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, textTransform: 'capitalize' }}>{n.type}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: '#a0a0b8' }}>{n.target}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#a0a0b8', marginTop: 4 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#606080', marginTop: 6 }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Send Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#0d0d1f', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: 28, width: '100%', maxWidth: 480 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FiBell size={18} color="#818cf8" />
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>Send Notification</h3>
                </div>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#a0a0b8', cursor: 'pointer' }}><FiX size={18} /></button>
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} style={inputS} placeholder="Notification title" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Message *</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} style={{ ...inputS, minHeight: 80, resize: 'vertical' }} placeholder="Notification message..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Target</label>
                    <select value={form.target} onChange={e => setForm(p => ({...p, target: e.target.value}))} style={inputS}>
                      <option value="all" style={{ background: '#0d0d1f' }}>All Users</option>
                      <option value="attendees" style={{ background: '#0d0d1f' }}>Attendees</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} style={inputS}>
                      {['info','success','warning','error'].map(t => <option key={t} value={t} style={{ background: '#0d0d1f' }}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: '#a0a0b8', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button onClick={send} disabled={sending} className="btn btn-primary" style={{ flex: 1, padding: '10px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <FiSend size={13} /> {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
