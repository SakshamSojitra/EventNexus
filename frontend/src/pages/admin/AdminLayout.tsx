import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiCalendar, FiBookOpen, FiUsers, FiTag, FiDollarSign,
  FiBarChart2, FiStar, FiBell, FiPercent, FiFileText, FiSettings,
  FiLogOut, FiMenu, FiX, FiShield,
} from 'react-icons/fi';
import { useStore } from '../../store/useStore';
import AdminHeader from '../../components/AdminHeader';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/admin/dashboard',     icon: FiGrid,      label: 'Dashboard' },
  { to: '/admin/events',        icon: FiCalendar,  label: 'Events' },
  { to: '/admin/bookings',      icon: FiBookOpen,  label: 'Bookings' },
  { to: '/admin/users',         icon: FiUsers,     label: 'Users' },
  { to: '/admin/categories',    icon: FiTag,       label: 'Categories' },
  { to: '/admin/revenue',       icon: FiDollarSign,label: 'Revenue' },
  { to: '/admin/analytics',     icon: FiBarChart2, label: 'Analytics' },
  { to: '/admin/reviews',       icon: FiStar,      label: 'Reviews' },
  { to: '/admin/notifications', icon: FiBell,      label: 'Notifications' },
  { to: '/admin/coupons',       icon: FiPercent,   label: 'Coupons' },
  { to: '/admin/reports',       icon: FiFileText,  label: 'Reports' },
  { to: '/admin/settings',      icon: FiSettings,  label: 'Settings' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  const sidebarW = collapsed ? 72 : 240;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#050816' }}>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
          background: 'rgba(5,8,22,0.97)', backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? '18px 16px' : '18px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
          minHeight: 64,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FiShield size={18} color="#fff" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>EventNexus</div>
                <div style={{ fontSize: 10, color: '#a0a0b8' }}>Admin Panel</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin/dashboard'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '10px 18px' : '10px 12px',
                borderRadius: 10, marginBottom: 2, textDecoration: 'none',
                color: isActive ? '#fff' : '#a0a0b8',
                background: isActive ? 'rgba(79,70,229,0.18)' : 'transparent',
                borderLeft: isActive ? '2px solid #4F46E5' : '2px solid transparent',
                transition: 'all 0.15s', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500,
              })}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user + logout + collapse toggle */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {user?.name?.[0]?.toUpperCase() ?? 'A'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name ?? 'Admin'}
                  </div>
                  <div style={{ fontSize: 10, color: '#a0a0b8' }}>Administrator</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: collapsed ? '10px 18px' : '10px 12px',
              borderRadius: 10, background: 'none', border: 'none',
              color: '#EF4444', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            <FiLogOut size={17} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: 8, borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: 'none',
              color: '#a0a0b8', cursor: 'pointer', marginTop: 4,
            }}
          >
            {collapsed ? <FiMenu size={16} /> : <FiX size={16} />}
          </button>
        </div>
      </motion.aside>

      {/* ── Right side: header + scrollable content ── */}
      <motion.div
        animate={{ marginLeft: sidebarW }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}
      >
        <AdminHeader sidebarW={sidebarW} />

        {/* Page content — scrollable */}
        <main style={{ flex: 1, overflowY: 'auto', paddingTop: 64 }}>
          <div style={{ padding: '28px 24px' }}>
            <Outlet />
          </div>
        </main>
      </motion.div>
    </div>
  );
}
