import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPlus, FiBarChart2, FiCalendar, FiUsers, FiDollarSign, FiEye } from 'react-icons/fi';

const OrganizerDashboard = () => {
  return (
    <section style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}
        >
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700 }}>Organizer Dashboard</h1>
            <p style={{ fontSize: 14, color: '#a0a0b8', marginTop: 8 }}>Manage your events and analytics</p>
          </div>
          <Link to="/create-event" className="btn btn-primary" style={{ padding: '12px 24px' }}>
            <FiPlus /> Create Event
          </Link>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { icon: FiCalendar, label: 'Total Events', value: '12', color: '#4F46E5' },
            { icon: FiUsers, label: 'Total Attendees', value: '2,847', color: '#7C3AED' },
            { icon: FiDollarSign, label: 'Revenue', value: '₹48,290', color: '#10B981' },
            { icon: FiEye, label: 'Page Views', value: '14.2K', color: '#06B6D4' },
          ].map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <w.icon style={{ color: w.color, fontSize: 24, marginBottom: 16 }} />
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{w.value}</div>
              <div style={{ fontSize: 13, color: '#a0a0b8', marginTop: 4 }}>{w.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Event List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Your Events</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    background: `linear-gradient(135deg, ${['#4F46E5','#7C3AED','#06B6D4'][i-1]}, ${['#7C3AED','#06B6D4','#4F46E5'][i-1]}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700,
                  }}>
                    {i}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>Event {i}</div>
                    <div style={{ fontSize: 12, color: '#a0a0b8', marginTop: 2 }}>Mar {15 + i}, 2027</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#10B981', padding: '4px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: 6 }}>Published</span>
                  <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#a0a0b8', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OrganizerDashboard;