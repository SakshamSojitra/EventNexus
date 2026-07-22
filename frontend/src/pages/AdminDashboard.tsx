import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiDollarSign, FiActivity, FiShield, FiBarChart2 } from 'react-icons/fi';

const AdminDashboard = () => {
  return (
    <section style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Admin Control Center
          </h1>
          <p style={{ fontSize: 14, color: '#a0a0b8', marginBottom: 40 }}>
            Enterprise-grade event management oversight
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { icon: FiUsers, label: 'Total Users', value: '24,580', change: '+12%', color: '#4F46E5' },
            { icon: FiCalendar, label: 'Total Events', value: '1,847', change: '+8%', color: '#7C3AED' },
            { icon: FiDollarSign, label: 'Revenue', value: '₹284,920', change: '+23%', color: '#10B981' },
            { icon: FiShield, label: 'Active Admins', value: '8', change: 'Stable', color: '#06B6D4' },
          ].map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <w.icon style={{ color: w.color, fontSize: 24 }} />
                <span style={{ fontSize: 12, color: '#10B981', padding: '2px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: 4 }}>{w.change}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{w.value}</div>
              <div style={{ fontSize: 13, color: '#a0a0b8', marginTop: 4 }}>{w.label}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* User Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Recent Users</h3>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                    U
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>User {i}</div>
                    <div style={{ fontSize: 11, color: '#a0a0b8' }}>user{i}@example.com</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: '#4F46E5', padding: '2px 8px', background: 'rgba(79,70,229,0.1)', borderRadius: 4, textTransform: 'capitalize' }}>
                  user
                </span>
              </div>
            ))}
          </motion.div>

          {/* System Monitoring */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>System Status</h3>
            {[
              { label: 'API Status', value: 'Healthy', color: '#10B981' },
              { label: 'Database', value: 'Connected', color: '#10B981' },
              { label: 'Socket.io', value: 'Online', color: '#10B981' },
              { label: 'Storage', value: '68% Used', color: '#F59E0B' },
              { label: 'Uptime', value: '99.9%', color: '#10B981' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{ fontSize: 13, color: '#a0a0b8' }}>{s.label}</span>
                <span style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;