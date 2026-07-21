import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiChevronRight, FiClock } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const TYPE_ICONS: Record<string, string> = {
  information: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '🚨',
  promotion: '🎉',
  reminder: '⏰',
  system_update: '⚙️',
  event_update: '📅',
  booking_update: '🎫',
  payment_update: '💳',
};

export default function NotificationBell({ userType = 'user' }: { userType?: 'user' | 'admin' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, isConnected } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    if (userType === 'admin') {
      navigate('/admin/notifications');
    } else {
      navigate('/dashboard/notifications');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Take only the most recent 5 notifications
  const recentNotifs = notifications.slice(0, 5);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#a0a0b8', cursor: 'pointer', flexShrink: 0,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
      >
        <FiBell size={16} />
        {isConnected && (
          <span style={{
            position: 'absolute', top: 0, right: 0, width: 8, height: 8,
            borderRadius: '50%', background: '#10B981', border: '2px solid #050816',
          }} />
        )}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 16, height: 16, borderRadius: 8,
            background: '#EF4444', color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 360,
              background: 'rgba(10,10,28,0.98)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              zIndex: 100,
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{ fontSize: 11, color: '#a0a0b8', fontWeight: 400, marginLeft: 6 }}>
                    ({unreadCount} unread)
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                  style={{
                    background: 'none', border: 'none', color: '#818cf8',
                    cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}
                >
                  <FiCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {recentNotifs.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                  <div style={{ fontSize: 13, color: '#a0a0b8' }}>No notifications yet</div>
                </div>
              ) : (
                recentNotifs.map((n) => {
                  const icon = TYPE_ICONS[n.type] || 'ℹ️';
                  return (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (!n.isRead) markAsRead(n._id);
                      }}
                      style={{
                        padding: '10px 16px',
                        display: 'flex', gap: 10,
                        cursor: 'pointer',
                        background: n.isRead ? 'transparent' : 'rgba(79,70,229,0.06)',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = n.isRead ? 'transparent' : 'rgba(79,70,229,0.06)';
                      }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{
                            fontSize: 12, fontWeight: n.isRead ? 500 : 700, color: n.isRead ? '#a0a0b8' : '#fff',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {n.title}
                          </span>
                          {!n.isRead && (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F46E5', flexShrink: 0, marginTop: 4 }} />
                          )}
                        </div>
                        <p style={{
                          fontSize: 11, color: '#606080', margin: '2px 0 0 0',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {n.message}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 10, color: '#404060', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <FiClock size={10} /> {formatTime(n.createdAt)}
                          </span>
                          <span style={{
                            fontSize: 9, padding: '1px 6px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.05)', color: '#606080',
                            textTransform: 'capitalize',
                          }}>
                            {n.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
            }}>
              <button
                onClick={handleViewAll}
                style={{
                  background: 'none', border: 'none', color: '#818cf8',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  width: '100%', padding: '4px 0',
                }}
              >
                View All Notifications <FiChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}