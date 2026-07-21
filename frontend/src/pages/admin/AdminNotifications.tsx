import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiBell, FiSearch, FiRefreshCw, FiClock, FiUsers, FiMail, FiCheckCircle, FiAlertCircle, FiChevronLeft, FiChevronRight, FiEye, FiTrash2, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';
import notificationService from '../../services/notificationService';

const inputS: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
  color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const TYPE_CFG: Record<string, { color: string; bg: string; emoji: string }> = {
  information:   { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',   emoji: 'ℹ️' },
  success:       { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  emoji: '✅' },
  warning:       { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  emoji: '⚠️' },
  error:         { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   emoji: '🚨' },
  promotion:     { color: '#A855F7', bg: 'rgba(168,85,247,0.12)',  emoji: '🎉' },
  reminder:      { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  emoji: '⏰' },
  system_update: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  emoji: '⚙️' },
  event_update:  { color: '#EC4899', bg: 'rgba(236,72,153,0.12)',  emoji: '📅' },
  booking_update:{ color: '#FB923C', bg: 'rgba(251,146,60,0.12)',  emoji: '🎫' },
  payment_update:{ color: '#10B981', bg: 'rgba(16,185,129,0.12)',  emoji: '💳' },
};

const TARGET_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'specific', label: 'Specific User' },
  { value: 'event_participants', label: 'Event Participants' },
  { value: 'ticket_buyers', label: 'Ticket Buyers' },
  { value: 'attendees', label: 'Attendees' },
  { value: 'admin', label: 'Admin Only' },
  { value: 'organizers', label: 'Organizers' },
];

const TYPE_OPTIONS = [
  'information', 'success', 'warning', 'error', 'promotion',
  'reminder', 'system_update', 'event_update', 'booking_update', 'payment_update',
];

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'stats'>('send');

  // ── Send Modal State ──
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    target: 'all',
    type: 'information',
    priority: 'medium',
    targetUsers: [] as string[],
    targetEvent: '',
    expiresAt: '',
  });

  // ── Users/Events for selects ──
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState('');

  // ── History State ──
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPages, setHistoryPages] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historyType, setHistoryType] = useState('');
  const [historyTarget, setHistoryTarget] = useState('');

  // ── Stats State ──
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Legacy list ──
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch helpers ──
  const fetchUsers = useCallback(async (search = '') => {
    try {
      const { data } = await API.get('/admin/users', { params: { limit: 50, search } });
      setUsers(data.users || []);
    } catch { /* ignore */ }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await API.get('/admin/events', { params: { limit: 100 } });
      setEvents(data.events || []);
    } catch { /* ignore */ }
  }, []);

  const fetchLegacy = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/notifications');
      setNotifs(data || []);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, []);

  const fetchHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    try {
      const data = await notificationService.getNotificationHistory({
        page,
        limit: 15,
        search: historySearch || undefined,
        type: historyType || undefined,
        target: historyTarget || undefined,
      });
      setHistory(data.notifications || []);
      setHistoryTotal(data.total || 0);
      setHistoryPages(data.totalPages || 1);
      setHistoryPage(data.currentPage || 1);
    } catch { toast.error('Failed to load history'); }
    finally { setHistoryLoading(false); }
  }, [historySearch, historyType, historyTarget]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await notificationService.getNotificationStatistics();
      setStats(data);
    } catch { /* ignore */ }
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchEvents();
    fetchLegacy();
    fetchHistory();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [historySearch, historyType, historyTarget]);

  // ── Send Notification ──
  const send = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.message.trim()) { toast.error('Message is required'); return; }
    setSending(true);
    try {
      const result = await notificationService.sendNotification({
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        target: form.target,
        priority: form.priority,
        targetUsers: form.targetUsers.length > 0 ? form.targetUsers : undefined,
        targetEvent: form.targetEvent || undefined,
        expiresAt: form.expiresAt || undefined,
      });
      toast.success(`Notification sent! (${result.recipientCount} recipients)`);
      setForm({ title: '', message: '', target: 'all', type: 'information', priority: 'medium', targetUsers: [], targetEvent: '', expiresAt: '' });
      fetchLegacy();
      fetchHistory();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send');
    } finally { setSending(false); }
  };

  // ── Resend Emails ──
  const handleResend = async (id: string) => {
    try {
      await notificationService.resendEmails(id);
      toast.success('Emails resent');
      fetchHistory();
    } catch { toast.error('Failed to resend'); }
  };

  // ── Format date ──
  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div>
      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, maxWidth: 480 }}>
        {[
          { key: 'send', label: 'Send', icon: FiSend },
          { key: 'history', label: 'History', icon: FiClock },
          { key: 'stats', label: 'Statistics', icon: FiBarChart2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            style={{
              flex: 1, padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
              background: activeTab === key ? 'rgba(79,70,229,0.2)' : 'transparent',
              border: 'none', color: activeTab === key ? '#818cf8' : '#a0a0b8',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1: SEND NOTIFICATION
          ════════════════════════════════════════════════════════════ */}
      {activeTab === 'send' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 600 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <FiBell size={20} color="#818cf8" />
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Send Notification</h3>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputS} placeholder="e.g. System Maintenance Tonight" />
              </div>

              {/* Message */}
              <div>
                <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Message *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ ...inputS, minHeight: 100, resize: 'vertical' }} placeholder="Enter your notification message..." />
              </div>

              {/* Target + Type + Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Target</label>
                  <select value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} style={inputS}>
                    {TARGET_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} style={{ background: '#0d0d1f' }}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inputS}>
                    {TYPE_OPTIONS.map(t => (
                      <option key={t} value={t} style={{ background: '#0d0d1f' }}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={inputS}>
                    {['low', 'medium', 'high', 'urgent'].map(p => (
                      <option key={p} value={p} style={{ background: '#0d0d1f' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional: Specific User */}
              {(form.target === 'specific') && (
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Select Users</label>
                  <input
                    value={searchUser}
                    onChange={e => { setSearchUser(e.target.value); fetchUsers(e.target.value); }}
                    placeholder="Search users..."
                    style={inputS}
                  />
                  <div style={{ maxHeight: 140, overflowY: 'auto', marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {users.filter(u => u.name?.toLowerCase().includes(searchUser.toLowerCase()) || u.email?.toLowerCase().includes(searchUser.toLowerCase())).slice(0, 20).map(u => {
                      const selected = form.targetUsers.includes(u._id);
                      return (
                        <button
                          key={u._id}
                          onClick={() => setForm(p => ({
                            ...p,
                            targetUsers: selected ? p.targetUsers.filter(id => id !== u._id) : [...p.targetUsers, u._id],
                          }))}
                          style={{
                            padding: '4px 10px', borderRadius: 8, fontSize: 11,
                            background: selected ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${selected ? 'rgba(79,70,229,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            color: selected ? '#818cf8' : '#a0a0b8',
                            cursor: 'pointer',
                          }}
                        >
                          {u.name || u.email}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conditional: Event */}
              {['event_participants', 'ticket_buyers', 'attendees'].includes(form.target) && (
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Select Event</label>
                  <select value={form.targetEvent} onChange={e => setForm(p => ({ ...p, targetEvent: e.target.value }))} style={inputS}>
                    <option value="" style={{ background: '#0d0d1f' }}>-- Select Event --</option>
                    {events.map(e => (
                      <option key={e._id} value={e._id} style={{ background: '#0d0d1f' }}>{e.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Expires At */}
              <div>
                <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Expires At (optional)</label>
                <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} style={inputS} />
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={send}
              disabled={sending}
              className="btn btn-primary"
              style={{
                marginTop: 20, padding: '12px 24px', fontSize: 14, width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: sending ? 'rgba(79,70,229,0.3)' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              }}
            >
              <FiSend size={14} /> {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 2: HISTORY
          ════════════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <FiSearch size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#606080' }} />
              <input
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="Search title or message..."
                style={{ ...inputS, paddingLeft: 34 }}
              />
            </div>
            <select value={historyType} onChange={e => setHistoryType(e.target.value)} style={{ ...inputS, width: 140 }}>
              <option value="" style={{ background: '#0d0d1f' }}>All Types</option>
              {TYPE_OPTIONS.map(t => (
                <option key={t} value={t} style={{ background: '#0d0d1f' }}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select value={historyTarget} onChange={e => setHistoryTarget(e.target.value)} style={{ ...inputS, width: 140 }}>
              <option value="" style={{ background: '#0d0d1f' }}>All Targets</option>
              {TARGET_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#0d0d1f' }}>{o.label}</option>
              ))}
            </select>
            <button onClick={() => fetchHistory(1)} style={{ padding: '8px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a0a0b8', cursor: 'pointer' }}>
              <FiRefreshCw size={14} />
            </button>
          </div>

          {historyLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array(5).fill(0).map((_, i) => <div key={i} style={{ height: 70, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />)}
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No notification history</div>
              <div style={{ fontSize: 13, color: '#a0a0b8' }}>Send a notification to see it here</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 12 }}>{historyTotal} notifications sent</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.map((n: any, i: number) => {
                  const cfg = TYPE_CFG[n.type] || TYPE_CFG.information;
                  return (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      style={{
                        padding: '14px 18px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {cfg.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{n.title}</span>
                            <span style={{ fontSize: 11, color: '#606080', marginLeft: 8 }}>by {n.createdBy?.name || 'Admin'}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, textTransform: 'capitalize' }}>{n.type?.replace(/_/g, ' ')}</span>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: '#a0a0b8', textTransform: 'capitalize' }}>{n.target?.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: '#a0a0b8', margin: '4px 0', lineHeight: 1.4 }}>{n.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#606080' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiUsers size={11} /> {n.recipientCount || 0} recipients</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCheckCircle size={11} color="#10B981" /> {n.emailSentCount || 0} sent</span>
                            {(n.emailFailedCount || 0) > 0 && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiAlertCircle size={11} color="#EF4444" /> {n.emailFailedCount} failed</span>
                            )}
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={11} /> {formatDate(n.createdAt)}</span>
                          </div>
                          {(n.emailFailedCount || 0) > 0 && (
                            <button
                              onClick={() => handleResend(n._id)}
                              style={{
                                padding: '4px 10px', borderRadius: 6, fontSize: 10,
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                color: '#EF4444', cursor: 'pointer',
                              }}
                            >
                              Resend
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {historyPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
                  <button disabled={historyPage <= 1} onClick={() => fetchHistory(historyPage - 1)}
                    style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: historyPage <= 1 ? '#404060' : '#fff', cursor: historyPage <= 1 ? 'not-allowed' : 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiChevronLeft size={14} /> Prev
                  </button>
                  <span style={{ fontSize: 13, color: '#a0a0b8' }}>Page {historyPage} of {historyPages}</span>
                  <button disabled={historyPage >= historyPages} onClick={() => fetchHistory(historyPage + 1)}
                    style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: historyPage >= historyPages ? '#404060' : '#fff', cursor: historyPage >= historyPages ? 'not-allowed' : 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Next <FiChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 3: STATISTICS
          ════════════════════════════════════════════════════════════ */}
      {activeTab === 'stats' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {statsLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ height: 100, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : !stats ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>No statistics available</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Total Notifications', value: stats.totalNotifications, icon: FiBell, color: '#4F46E5' },
                  { label: "Today's Notifications", value: stats.todayNotifications, icon: FiClock, color: '#F59E0B' },
                  { label: 'Total Recipients', value: stats.totalRecipients, icon: FiUsers, color: '#10B981' },
                  { label: 'Unique Recipients', value: stats.uniqueRecipients, icon: FiUsers, color: '#06B6D4' },
                  { label: 'Emails Sent', value: stats.emailsSent, icon: FiMail, color: '#10B981' },
                  { label: 'Failed Emails', value: stats.emailsFailed, icon: FiAlertCircle, color: '#EF4444' },
                  { label: 'Unread Notifications', value: stats.totalUnread, icon: FiBell, color: '#8B5CF6' },
                  { label: 'Delivery Rate', value: `${stats.deliveryRate}%`, icon: FiCheckCircle, color: '#10B981' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      padding: 20, background: 'rgba(255,255,255,0.03)',
                      borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${s.color}15`, border: `1px solid ${s.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <s.icon size={16} color={s.color} />
                      </div>
                      <span style={{ fontSize: 11, color: '#a0a0b8' }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>
                      {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════
          Legacy List (always visible below active tab content)
          ════════════════════════════════════════════════════════════ */}
      {activeTab !== 'stats' && activeTab !== 'history' && (
        <>
          <div style={{ marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Recent Notifications</h4>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array(5).fill(0).map((_, i) => <div key={i} style={{ height: 76, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />)}
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🔔</div>
                <div style={{ fontSize: 14, color: '#a0a0b8' }}>No notifications sent yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {notifs.slice(0, 10).map((n, i) => {
                  const cfg = TYPE_CFG[n.type] || TYPE_CFG.info;
                  return (
                    <motion.div key={n._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{cfg.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</span>
                          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 12, background: cfg.bg, color: cfg.color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{n.type}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#a0a0b8', margin: '2px 0 0 0', lineHeight: 1.3 }}>{n.message}</p>
                        <span style={{ fontSize: 10, color: '#606080', marginTop: 4, display: 'inline-block' }}>{n.createdAt ? formatDate(n.createdAt) : ''}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}