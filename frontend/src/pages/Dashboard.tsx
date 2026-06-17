import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCalendar, FiSend, FiBookmark, FiUsers, FiTrendingUp, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { useStore } from '../store/useStore';

interface UserStats {
  totalEvents: number;
  totalTickets: number;
  savedEvents: number;
  networkingCount: number;
  rewardPoints: number;
}

const Dashboard = () => {
  const { user } = useStore();
  const [stats, setStats] = useState<UserStats>({
    totalEvents: 0, totalTickets: 0, savedEvents: 0,
    networkingCount: 0, rewardPoints: 0,
  });

  const widgets = [
    { icon: FiCalendar, label: 'Upcoming Events', value: stats.totalEvents, color: '#4F46E5', href: '/my-tickets' },
    { icon: FiSend, label: 'My Tickets', value: stats.totalTickets, color: '#7C3AED', href: '/my-tickets' },
    { icon: FiBookmark, label: 'Saved Events', value: stats.savedEvents, color: '#06B6D4', href: '/events' },
    { icon: FiUsers, label: 'Network', value: stats.networkingCount, color: '#10B981', href: '#' },
    { icon: FiTrendingUp, label: 'Reward Points', value: stats.rewardPoints, color: '#F59E0B', href: '#' },
  ];

  return (
    <section style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40 }}
        >
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700 }}>
            Welcome back, {user?.name}
          </h1>
          <p style={{ fontSize: 14, color: '#a0a0b8', marginTop: 8 }}>
            Here's what's happening with your events
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          {widgets.map((w, i) => (
            <Link key={i} to={w.href} style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: 24,
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: w.color + '22', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <w.icon style={{ color: w.color, fontSize: 18 }} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>
                  {w.value}
                </div>
                <div style={{ fontSize: 13, color: '#a0a0b8' }}>{w.label}</div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            padding: 32,
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.05))',
            borderRadius: 20,
            border: '1px solid rgba(79, 70, 229, 0.2)',
            marginBottom: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <FiRefreshCw style={{ color: '#4F46E5' }} />
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600 }}>
              AI Recommendations
            </h3>
          </div>
          <p style={{ fontSize: 14, color: '#a0a0b8', marginBottom: 16, lineHeight: 1.6 }}>
            Based on your interests and past events, we found some events you might love.
          </p>
          <Link to="/events" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
            View Recommendations <FiArrowRight />
          </Link>
        </motion.div>

        {/* Recent Activity */}
        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
            Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: 16, background: 'rgba(255,255,255,0.02)',
                borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 600, flexShrink: 0,
                }}>
                  {i}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Event activity #{i}</div>
                  <div style={{ fontSize: 12, color: '#a0a0b8', marginTop: 2 }}>2 hours ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;