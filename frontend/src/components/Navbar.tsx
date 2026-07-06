import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiUser, FiLogOut, FiPlus, FiTag } from 'react-icons/fi';
import API from '../utils/api';
import { useStore } from '../store/useStore';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      API.get('/my-ticket').then(({ data }) => setTicketCount(data.length)).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '16px 0',
        background: isScrolled ? 'rgba(5, 8, 22, 0.9)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            N
          </div>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Event Nexus
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link
            to="/"
            style={{
              color: '#a0a0b8',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#a0a0b8')}
          >
            Home
          </Link>
          <Link
            to="/events"
            style={{ color: '#a0a0b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.3s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#a0a0b8')}
          >
            Events
          </Link>

          {isAuthenticated && (
            <Link
              to="/my-tickets"
              style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
                  border: '1px solid rgba(79,70,229,0.35)',
                  borderRadius: 10,
                  fontSize: 13, fontWeight: 600, color: '#818cf8',
                  boxShadow: '0 0 16px rgba(79,70,229,0.15)',
                }}
              >
                <FiTag size={13} />
                My Tickets
                {ticketCount > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 100,
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px',
                  }}>
                    {ticketCount}
                  </span>
                )}
              </motion.div>
            </Link>
          )}

          {isAuthenticated ? (
            <>
              {user?.role === 'organizer' || user?.role === 'admin' ? (
                <Link to="/create-event" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
                  <FiPlus /> Create Event
                </Link>
              ) : null}

              {/* Profile Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.1)',
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 12,
                        minWidth: 220,
                        background: 'rgba(10, 10, 26, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        padding: 8,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                      }}
                    >
                      <div style={{ padding: '12px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{user?.name}</div>
                        <div style={{ fontSize: 12, color: '#a0a0b8', marginTop: 2 }}>{user?.email}</div>
                        <div style={{ fontSize: 11, color: '#4F46E5', marginTop: 4, textTransform: 'capitalize' }}>{user?.role}</div>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          color: '#a0a0b8',
                          textDecoration: 'none',
                          fontSize: 13,
                          borderRadius: 8,
                          transition: 'all 0.2s',
                        }}
                      >
                        <FiUser size={14} /> Dashboard
                      </Link>

                      <Link
                        to="/my-tickets"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          color: '#a0a0b8',
                          textDecoration: 'none',
                          fontSize: 13,
                          borderRadius: 8,
                          transition: 'all 0.2s',
                        }}
                      >
                        My Tickets
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 12px',
                            color: '#a0a0b8',
                            textDecoration: 'none',
                            fontSize: 13,
                            borderRadius: 8,
                            transition: 'all 0.2s',
                          }}
                        >
                          Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '10px 12px',
                          color: '#ef4444',
                          background: 'none',
                          border: 'none',
                          fontSize: 13,
                          cursor: 'pointer',
                          borderRadius: 8,
                          transition: 'all 0.2s',
                        }}
                      >
                        <FiLogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: 13 }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 24,
            }}
          >
            {isMobileMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;