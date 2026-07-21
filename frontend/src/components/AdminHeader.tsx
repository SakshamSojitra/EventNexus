import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiMessageSquare, FiChevronDown,
  FiLogOut, FiUser, FiSettings, FiShield,
} from 'react-icons/fi';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell';

const PAGE_TITLES: Record<string, { title: string; crumb: string }> = {
  '/admin/dashboard':     { title: 'Dashboard',     crumb: 'Overview' },
  '/admin/events':        { title: 'Events',         crumb: 'Manage Events' },
  '/admin/bookings':      { title: 'Bookings',       crumb: 'Manage Bookings' },
  '/admin/users':         { title: 'Users',          crumb: 'Manage Users' },
  '/admin/categories':    { title: 'Categories',     crumb: 'Manage Categories' },
  '/admin/revenue':       { title: 'Revenue',        crumb: 'Revenue Overview' },
  '/admin/analytics':     { title: 'Analytics',      crumb: 'Analytics & Reports' },
  '/admin/reviews':       { title: 'Reviews',        crumb: 'Manage Reviews' },
  '/admin/notifications': { title: 'Notifications',  crumb: 'Send Notifications' },
  '/admin/coupons':       { title: 'Coupons',        crumb: 'Manage Coupons' },
  '/admin/reports':       { title: 'Reports',        crumb: 'Generate Reports' },
  '/admin/settings':      { title: 'Settings',       crumb: 'System Settings' },
};

export default function AdminHeader({ sidebarW }: { sidebarW: number }) {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const meta = PAGE_TITLES[pathname] ?? { title: 'Admin', crumb: 'Panel' };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: sidebarW,
        right: 0,
        height: 64,
        zIndex: 30,
        background: 'rgba(5,8,22,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        transition: 'left 0.25s ease',
      }}
    >
      {/* Page title + breadcrumb */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#606080', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 1 }}>
          Admin Panel / {meta.crumb}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {meta.title}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', width: 220 }}>
        <FiSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#606080' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          style={{
            width: '100%', padding: '7px 12px 7px 34px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 9, color: '#fff', fontSize: 13, outline: 'none',
          }}
        />
      </div>

      {/* Icon buttons */}
      <button
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#a0a0b8', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <FiMessageSquare size={16} />
      </button>

      {/* Real Notification Bell */}
      <NotificationBell userType="admin" />

      {/* Profile dropdown */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px 6px 6px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, cursor: 'pointer', color: '#fff',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{user?.name ?? 'Admin'}</div>
            <div style={{ fontSize: 10, color: '#a0a0b8', lineHeight: 1.2 }}>Administrator</div>
          </div>
          <FiChevronDown size={13} style={{ color: '#606080', marginLeft: 2 }} />
        </button>

        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                minWidth: 190,
                background: 'rgba(10,10,28,0.98)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 6,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                zIndex: 100,
              }}
            >
              {[
                { icon: FiUser, label: 'Profile' },
                { icon: FiShield, label: 'Security' },
                { icon: FiSettings, label: 'Settings', href: '/admin/settings' },
              ].map(({ icon: Icon, label, href }) => (
                <button
                  key={label}
                  onClick={() => { setProfileOpen(false); if (href) navigate(href); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 12px',
                    background: 'none', border: 'none',
                    color: '#a0a0b8', fontSize: 13, cursor: 'pointer',
                    borderRadius: 8, textAlign: 'left',
                  }}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
              <div style={{ margin: '4px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 12px',
                  background: 'none', border: 'none',
                  color: '#EF4444', fontSize: 13, cursor: 'pointer',
                  borderRadius: 8,
                }}
              >
                <FiLogOut size={14} /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
