import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiTrash2, FiMail, FiClock, FiFilter } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import Navbar from '../components/Navbar';

const TYPE_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  information:   { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',   icon: 'ℹ️' },
  success:       { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: '✅' },
  warning:       { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: '⚠️' },
  error:         { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: '🚨' },
  promotion:     { color: '#A855F7', bg: 'rgba(168,85,247,0.12)',  icon: '🎉' },
  reminder:      { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  icon: '⏰' },
  system_update: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  icon: '⚙️' },
  event_update:  { color: '#EC4899', bg: 'rgba(236,72,153,0.12)',  icon: '📅' },
  booking_update: { color: '#FB923C', bg: 'rgba(251,146,60,0.12)',  icon: '🎫' },
  payment_update: { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: '💳' },
};

const PRIORITY_CFG: Record<string, { color: string; label: string }> = {
  low:    { color: '#6B7280', label: 'Low' },
  medium: { color: '#F59E0B', label: 'Medium' },
  high:   { color: '#EF4444', label: 'High' },
  urgent: { color: '#DC2626', label: 'Urgent' },
};

export default function UserNotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    totalPages,
    currentPage,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchNotifications(1, unreadOnly);
  }, [unreadOnly]);

  const handlePageChange = (page: number) => {
    fetchNotifications(page, unreadOnly);
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const containerStyle: React.CSSProperties = {
    paddingTop: 80,
    minHeight: '100vh',
    position: 'relative',
  };

  return (
    <>
      <div className="cursor-glow" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <Navbar />
      <section style={containerStyle}>
        <div className="container" style={{ maxWidth: 900 }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, margin: 0 }}>
                  Notifications
                </h1>
                <p style={{ fontSize: 14, color: '#a0a0b8', margin: '4px 0 0 0' }}>
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'No unread notifications'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <FiCheck size={14} /> Mark All Read
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, marginTop: 16 }}>
            <button
              onClick={() => setUnreadOnly(false)}
              style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: !unreadOnly ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${!unreadOnly ? 'rgba(79,70,229,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: !unreadOnly ? '#818cf8' : '#a0a0b8',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <FiBell size={12} /> All
            </button>
            <button
              onClick={() => setUnreadOnly(true)}
              style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: unreadOnly ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${unreadOnly ? 'rgba(79,70,229,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: unreadOnly ? '#818cf8' : '#a0a0b8',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <FiFilter size={12} /> Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ height: 100, borderRadius: 12, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: '80px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔔</div>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
              </div>
              <div style={{ fontSize: 14, color: '#a0a0b8', maxWidth: 360, margin: '0 auto' }}>
                {unreadOnly ? 'You\'ve read all your notifications. Great job!' : 'When you receive notifications, they\'ll appear here.'}
              </div>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnimatePresence>
                {notifications.map((n, i) => {
                  const typeCfg = TYPE_CFG[n.type] || TYPE_CFG.information;
                  const priorityCfg = PRIORITY_CFG[n.priority] || PRIORITY_CFG.medium;
                  return (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: i * 0.02 }}
                      layout
                      style={{
                        padding: '16px 18px',
                        background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(79,70,229,0.06)',
                        borderRadius: 14,
                        border: `1px solid ${n.isRead ? 'rgba(255,255,255,0.06)' : 'rgba(79,70,229,0.15)'}`,
                        display: 'flex',
                        gap: 14,
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => { if (!n.isRead) handleMarkAsRead(n._id); }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(79,70,229,0.06)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, background: typeCfg.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0,
                        border: `1px solid ${typeCfg.color}30`,
                      }}>
                        {typeCfg.icon}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 14, fontWeight: n.isRead ? 500 : 700, color: n.isRead ? '#d0d0e0' : '#fff' }}>
                              {n.title}
                            </span>
                            {!n.isRead && (
                              <span style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: '#4F46E5', flexShrink: 0,
                                boxShadow: '0 0 8px rgba(79,70,229,0.5)',
                              }} />
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <span style={{
                              fontSize: 10, padding: '2px 8px', borderRadius: 20,
                              background: typeCfg.bg, color: typeCfg.color, textTransform: 'capitalize',
                              fontWeight: 500,
                            }}>
                              {n.type.replace(/_/g, ' ')}
                            </span>
                            {n.priority && n.priority !== 'medium' && (
                              <span style={{
                                fontSize: 10, padding: '2px 8px', borderRadius: 20,
                                background: `${priorityCfg.color}20`, color: priorityCfg.color,
                                fontWeight: 500,
                              }}>
                                {priorityCfg.label}
                              </span>
                            )}
                          </div>
                        </div>

                        <p style={{
                          fontSize: 13, color: '#a0a0b8', margin: '6px 0 8px 0',
                          lineHeight: 1.5, wordBreak: 'break-word',
                        }}>
                          {n.message}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 11, color: '#606080', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <FiClock size={11} /> {formatDate(n.createdAt)}
                            </span>
                            {n.sender && (
                              <span style={{ fontSize: 11, color: '#606080' }}>
                                via {n.sender}
                              </span>
                            )}
                            {n.emailSent && (
                              <span style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <FiMail size={11} /> Emailed
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {!n.isRead && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n._id); }}
                                style={{
                                  width: 28, height: 28, borderRadius: 8,
                                  background: 'rgba(79,70,229,0.15)', border: 'none',
                                  color: '#818cf8', cursor: 'pointer', fontSize: 12,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                                title="Mark as read"
                              >
                                <FiCheck size={14} />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                              style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: 'rgba(239,68,68,0.1)', border: 'none',
                                color: '#EF4444', cursor: 'pointer', fontSize: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                              title="Delete"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{
                  padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)', color: currentPage <= 1 ? '#404060' : '#fff',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <FiChevronLeft size={14} /> Prev
              </button>
              <span style={{ fontSize: 13, color: '#a0a0b8' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                style={{
                  padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)', color: currentPage >= totalPages ? '#404060' : '#fff',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                Next <FiChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}