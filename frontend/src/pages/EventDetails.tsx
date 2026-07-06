import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiClock, FiUsers, FiShare2, FiHeart, FiCheck } from 'react-icons/fi';
import { useStore } from '../store/useStore';
import { useBooking, TicketType } from '../hooks/useBooking';
import BookingModal from '../components/BookingModal';
import toast from 'react-hot-toast';

const TICKETS = [
  {
    type: 'free' as TicketType,
    name: 'General Admission',
    price: 0,
    label: 'FREE',
    desc: 'Standard access to all main sessions',
    perks: ['Main stage access', 'Networking area', 'Event materials'],
    color: '#10B981',
    gradient: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    type: 'premium' as TicketType,
    name: 'Premium Pass',
    price: 299,
    label: '$299',
    desc: 'All access including workshops',
    perks: ['Everything in General', 'All workshops', 'Speaker meet & greet', 'Premium swag bag'],
    color: '#4F46E5',
    gradient: 'rgba(79,70,229,0.08)',
    border: 'rgba(79,70,229,0.3)',
  },
  {
    type: 'vip' as TicketType,
    name: 'VIP Experience',
    price: 599,
    label: '$599',
    desc: 'Ultimate VIP treatment',
    perks: ['Everything in Premium', 'VIP lounge access', 'Private dinner', 'Front-row seating', 'Exclusive afterparty'],
    color: '#F59E0B',
    gradient: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
  },
];

const EventDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useStore();
  const [selectedTicket, setSelectedTicket] = useState<TicketType | ''>('');
  const { phase, loadingText, progress, booking, error, bookTicket, goToTicket, reset } = useBooking();

  const handleCheckout = async () => {
    if (!selectedTicket) return;
    if (!isAuthenticated) {
      toast.error('Please login to book a ticket');
      return;
    }
    // Use a real event ID if available, else fallback for demo
    const eventId = id || '000000000000000000000001';
    await bookTicket(eventId, selectedTicket);
  };

  const selected = TICKETS.find((t) => t.type === selectedTicket);

  return (
    <section style={{ paddingTop: 80, minHeight: '100vh' }}>
      <BookingModal
        phase={phase}
        loadingText={loadingText}
        progress={progress}
        ticketType={selectedTicket}
        error={error}
        onViewTicket={goToTicket}
        onClose={reset}
      />

      {/* Hero Banner */}
      <div style={{
        height: 420,
        background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
        position: 'relative', display: 'flex', alignItems: 'flex-end',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(79,70,229,0.15), transparent)' }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(79,70,229,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: 40 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ padding: '4px 14px', background: 'rgba(79,70,229,0.2)', borderRadius: 100, fontSize: 12, color: '#818cf8', border: '1px solid rgba(79,70,229,0.3)' }}>
              AI Conference
            </span>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 700, margin: '16px 0', lineHeight: 1.1 }}>
              AI Summit 2027
            </h1>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { icon: FiCalendar, text: 'March 15, 2027' },
                { icon: FiClock, text: '9:00 AM – 6:00 PM' },
                { icon: FiMapPin, text: 'San Francisco, CA' },
                { icon: FiUsers, text: '1,500 attendees' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#a0a0b8' }}>
                  <Icon size={14} /> {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 420px', gap: 40, paddingBottom: 80 }}>
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
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: 'flex', gap: 20, padding: 16,
                  background: 'rgba(255,255,255,0.02)', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600, minWidth: 80 }}>{s.time}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#a0a0b8', marginTop: 2 }}>{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sidebar – Ticket Selection */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{
            padding: 28,
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'sticky', top: 100,
          }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Get Tickets</h3>
            <p style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 20 }}>Select your ticket type below</p>

            {TICKETS.map((t) => {
              const isSelected = selectedTicket === t.type;
              return (
                <motion.button
                  key={t.type}
                  onClick={() => setSelectedTicket(t.type)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    width: '100%', padding: '16px 18px', marginBottom: 12,
                    background: isSelected ? t.gradient : 'rgba(255,255,255,0.02)',
                    border: isSelected ? `1.5px solid ${t.border}` : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? `0 0 20px ${t.color}22` : 'none',
                    position: 'relative',
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      width: 20, height: 20, borderRadius: '50%',
                      background: t.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FiCheck size={11} color="#fff" />
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>{t.name}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: t.color, marginLeft: 8 }}>{t.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 10 }}>{t.desc}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {t.perks.map((perk, pi) => (
                      <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a0a0b8' }}>
                        <FiCheck size={10} color={t.color} /> {perk}
                      </div>
                    ))}
                  </div>
                </motion.button>
              );
            })}

            {/* Checkout Button */}
            <motion.button
              onClick={handleCheckout}
              disabled={!selectedTicket || phase !== 'idle'}
              whileHover={selectedTicket && phase === 'idle' ? { scale: 1.02, boxShadow: '0 8px 30px rgba(79,70,229,0.5)' } : {}}
              whileTap={selectedTicket && phase === 'idle' ? { scale: 0.98 } : {}}
              style={{
                width: '100%', padding: '15px 24px',
                background: selectedTicket
                  ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                  : 'rgba(255,255,255,0.04)',
                border: selectedTicket ? 'none' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, cursor: selectedTicket ? 'pointer' : 'not-allowed',
                color: selectedTicket ? '#fff' : '#a0a0b8',
                fontSize: 15, fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                marginTop: 4,
                transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {!selectedTicket
                ? 'Select a Ticket'
                : selected?.price === 0
                ? '🎫 Book Free Ticket'
                : `💳 Proceed to Checkout — ${selected?.label}`}
            </motion.button>

            {/* Stats */}
            <div style={{ marginTop: 20, padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#a0a0b8' }}>⭐ 4.8 Rating</span>
                <span style={{ fontSize: 12, color: '#a0a0b8' }}>🔥 156 booked</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#a0a0b8' }}>👥 340 spots left</span>
                <span style={{ fontSize: 12, color: '#a0a0b8' }}>📅 30 days away</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {[{ icon: FiHeart, label: 'Save' }, { icon: FiShare2, label: 'Share' }].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  style={{
                    flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                    cursor: 'pointer', color: '#a0a0b8', fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 900px) {
          .event-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default EventDetails;
