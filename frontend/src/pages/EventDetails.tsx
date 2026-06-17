import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiClock, FiUsers, FiShare2, FiHeart, FiStar } from 'react-icons/fi';

const EventDetails = () => {
  const { id } = useParams();
  const [selectedTicket, setSelectedTicket] = useState('');

  return (
    <section style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div style={{
        height: 400,
        background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
        position: 'relative', display: 'flex', alignItems: 'flex-end',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(79,70,229,0.15), transparent)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: 40 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ padding: '4px 12px', background: 'rgba(79,70,229,0.2)', borderRadius: 100, fontSize: 12, color: '#818cf8' }}>
              AI Conference
            </span>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 700, margin: '16px 0' }}>
              AI Summit 2027
            </h1>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#a0a0b8' }}>
                <FiCalendar size={14} /> March 15, 2027
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#a0a0b8' }}>
                <FiClock size={14} /> 9:00 AM - 6:00 PM
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#a0a0b8' }}>
                <FiMapPin size={14} /> San Francisco, CA
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#a0a0b8' }}>
                <FiUsers size={14} /> 1,500 attendees
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40 }}>
        {/* Main Content */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, marginBottom: 16 }}>About This Event</h2>
          <p style={{ fontSize: 14, color: '#a0a0b8', lineHeight: 1.8, marginBottom: 32 }}>
            Join us for the most anticipated AI conference of 2027! Featuring keynote speeches from industry leaders,
            hands-on workshops, networking opportunities, and the latest breakthroughs in artificial intelligence.
            This event brings together researchers, practitioners, and enthusiasts from around the globe.
          </p>

          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Schedule</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {[
              { time: '9:00 AM', title: 'Registration & Welcome Coffee', desc: 'Check-in and networking' },
              { time: '10:00 AM', title: 'Keynote: The Future of AI', desc: 'By industry leaders' },
              { time: '11:30 AM', title: 'Workshop Sessions', desc: 'Hands-on AI workshops' },
              { time: '1:00 PM', title: 'Networking Lunch', desc: 'Connect with peers' },
              { time: '2:30 PM', title: 'Panel Discussion', desc: 'AI ethics and regulation' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 20, padding: 16,
                background: 'rgba(255,255,255,0.02)', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600, minWidth: 80 }}>{s.time}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#a0a0b8', marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sidebar - Ticket Selection */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{
            padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 100,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Get Tickets</h3>

            {[
              { type: 'free', name: 'General Admission', price: 0, desc: 'Standard access' },
              { type: 'paid', name: 'Premium Pass', price: 299, desc: 'All access + workshops' },
              { type: 'vip', name: 'VIP Experience', price: 599, desc: 'Everything + VIP lounge' },
            ].map((t) => (
              <button
                key={t.type}
                onClick={() => setSelectedTicket(t.type)}
                style={{
                  width: '100%', padding: 16, marginBottom: 12,
                  background: selectedTicket === t.type ? 'rgba(79,70,229,0.1)' : 'rgba(255,255,255,0.02)',
                  border: selectedTicket === t.type ? '1px solid rgba(79,70,229,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: t.price === 0 ? '#10B981' : '#fff' }}>
                    {t.price === 0 ? 'Free' : '$' + t.price}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#a0a0b8' }}>{t.desc}</div>
              </button>
            ))}

            <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8 }}>
              {selectedTicket ? 'Proceed to Checkout' : 'Select a Ticket'}
            </button>

            <div style={{ marginTop: 20, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#a0a0b8' }}>⭐ 4.8 Rating</span>
                <span style={{ fontSize: 13, color: '#a0a0b8' }}>🔥 156 bought</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#a0a0b8' }}>👥 340 spots left</span>
                <span style={{ fontSize: 13, color: '#a0a0b8' }}>📅 30 days away</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: '#a0a0b8', fontSize: 13 }}>
                <FiHeart size={14} style={{ marginRight: 6 }} /> Save
              </button>
              <button style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: '#a0a0b8', fontSize: 13 }}>
                <FiShare2 size={14} style={{ marginRight: 6 }} /> Share
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EventDetails;