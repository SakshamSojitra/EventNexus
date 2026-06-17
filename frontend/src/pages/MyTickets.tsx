import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiDownload, FiShare2 } from 'react-icons/fi';

const MyTickets = () => {
  const tickets = [1, 2, 3];

  return (
    <section style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>My Tickets</h1>
          <p style={{ fontSize: 14, color: '#a0a0b8', marginBottom: 40 }}>Your event passes and digital tickets</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tickets.map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.04))',
                  borderRadius: 20,
                  border: '1px solid rgba(79,70,229,0.2)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Holographic effect */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(79,70,229,0.05) 50%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#818cf8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Digital Ticket</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>
                      AI Summit 202{i + 7}
                    </h3>
                    <div style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 16 }}>Premium Pass</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#a0a0b8' }}>
                        <FiCalendar size={14} /> March {15 + i}, 2027
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#a0a0b8' }}>
                        <FiMapPin size={14} /> San Francisco, CA
                      </div>
                    </div>

                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: 'rgba(16,185,129,0.1)',
                      borderRadius: 100,
                      fontSize: 11,
                      color: '#10B981',
                    }}>
                      TKT-{2027000 + i} • Active
                    </div>
                  </div>

                  {/* QR Code placeholder */}
                  <div style={{
                    width: 100, height: 100,
                    background: '#fff',
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 70, height: 70,
                      background: '#000',
                      borderRadius: 4,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute',
                        width: '100%', height: '100%',
                        background: 'repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%) 50% / 8px 8px',
                      }} />
                      <div style={{
                        width: 28, height: 28,
                        background: '#000',
                        borderRadius: 4,
                        zIndex: 1,
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '12px 24px',
                  borderTop: '1px solid rgba(79,70,229,0.1)',
                  display: 'flex', gap: 16,
                }}>
                  <button style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiDownload size={14} /> Download
                  </button>
                  <button style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiShare2 size={14} /> Share
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MyTickets;