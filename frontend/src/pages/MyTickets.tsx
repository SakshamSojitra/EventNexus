import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiDownload, FiShare2, FiCreditCard, FiRefreshCw, FiArrowLeft, FiHome, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import API from '../utils/api';
import { Booking } from '../hooks/useBooking';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  free: { label: 'FREE', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.03))' },
  premium: { label: 'PREMIUM', color: '#4F46E5', bg: 'rgba(79,70,229,0.12)', border: 'rgba(79,70,229,0.3)', gradient: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.05))' },
  vip: { label: 'VIP', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.03))' },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return 'March 15, 2027';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Countdown timer hook
function useCountdown(expiresAt?: string) {
  const calc = () => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, diff };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return time;
}

function CountdownBadge({ expiresAt, onExpired }: { expiresAt?: string; onExpired: () => void }) {
  const time = useCountdown(expiresAt);

  useEffect(() => {
    if (expiresAt && time === null) onExpired();
  }, [time]);

  if (!expiresAt) return null;

  const isExpired = time === null;
  const isUrgent = time !== null && time.diff < 3600000; // under 1 hour
  const isWarning = time !== null && time.diff < 86400000; // under 24 hours

  if (isExpired) {
    return (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px',
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 100, fontSize: 10, fontWeight: 700, color: '#EF4444',
        }}
      >
        <FiAlertTriangle size={9} /> EXPIRED
      </motion.span>
    );
  }

  const color = isUrgent ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';
  const bg = isUrgent ? 'rgba(239,68,68,0.1)' : isWarning ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)';
  const border = isUrgent ? 'rgba(239,68,68,0.3)' : isWarning ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.25)';
  const label = `${time.h}h ${time.m}m ${time.s}s`;

  return (
    <motion.span
      animate={isUrgent ? { opacity: [1, 0.5, 1] } : {}}
      transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px',
        background: bg, border: `1px solid ${border}`,
        borderRadius: 100, fontSize: 10, fontWeight: 700, color,
      }}
    >
      <FiClock size={9} /> {label}
    </motion.span>
  );
}

function TicketCard({ booking, index, onExpired }: { booking: Booking; index: number; onExpired: (id: string) => void }) {
  const cfg = TYPE_CONFIG[booking.ticketType] || TYPE_CONFIG.free;
  const [removing, setRemoving] = useState(false);

  const handleExpired = () => {
    setRemoving(true);
    toast('🕐 Ticket expired — event has ended', {
      style: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fff' },
      duration: 4000,
    });
    setTimeout(() => onExpired(booking._id), 1500);
  };
  const qrValue = JSON.stringify({
    bookingId: booking.bookingId,
    ticketNumber: booking.ticketNumber,
    userName: booking.user?.name,
    ticketType: booking.ticketType,
  });

  const handleDownload = async () => {
    try {
      // Dynamic import to keep bundle lean
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [148, 100] });

      // Background
      doc.setFillColor(11, 11, 22);
      doc.rect(0, 0, 148, 100, 'F');

      // Purple gradient strip
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 6, 100, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(booking.event?.title || 'AI Summit 2027', 14, 18);

      // Ticket type badge
      const [r, g, b] = booking.ticketType === 'vip' ? [245, 158, 11] : booking.ticketType === 'premium' ? [79, 70, 229] : [16, 185, 129];
      doc.setFillColor(r, g, b);
      doc.roundedRect(14, 22, 28, 7, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(cfg.label, 28, 27.5, { align: 'center' });

      // Details
      doc.setTextColor(160, 160, 184);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const details = [
        ['Ticket #', booking.ticketNumber],
        ['Booking ID', booking.bookingId.substring(0, 18) + '...'],
        ['Name', booking.user?.name || ''],
        ['Email', booking.user?.email || ''],
        ['Date', formatDate(booking.event?.dateTime?.startDate)],
        ['Venue', `${booking.event?.venue?.name || ''}, ${booking.event?.venue?.city || ''}`],
        ['Status', 'CONFIRMED'],
        ['Price', booking.price === 0 ? 'FREE' : `$${booking.price}`],
      ];
      details.forEach(([label, value], i) => {
        doc.setTextColor(120, 120, 150);
        doc.text(label + ':', 14, 38 + i * 7);
        doc.setTextColor(220, 220, 240);
        doc.text(value, 50, 38 + i * 7);
      });

      // Divider
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.3);
      doc.line(110, 8, 110, 92);

      // QR placeholder text (actual QR needs canvas)
      doc.setTextColor(160, 160, 184);
      doc.setFontSize(7);
      doc.text('SCAN QR CODE', 129, 50, { align: 'center' });
      doc.text(booking.ticketNumber, 129, 56, { align: 'center' });

      // Footer
      doc.setFillColor(20, 20, 40);
      doc.rect(0, 88, 148, 12, 'F');
      doc.setTextColor(100, 100, 130);
      doc.setFontSize(6);
      doc.text('EventNexus • Powered by AI • This ticket is non-transferable', 74, 95, { align: 'center' });

      doc.save(`ticket-${booking.ticketNumber}.pdf`);
      toast.success('Ticket downloaded!');
    } catch {
      toast.error('Download failed. Please try again.');
    }
  };

  const handleShare = async () => {
    const text = `🎫 I'm attending ${booking.event?.title || 'AI Summit 2027'}!\nTicket: ${booking.ticketNumber}\nType: ${cfg.label}`;
    if (navigator.share) {
      await navigator.share({ title: 'My Event Ticket', text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Ticket info copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={removing ? { opacity: 0, scale: 0.92, y: -20 } : { opacity: 1, y: 0 }}
      transition={removing ? { duration: 0.5 } : { delay: index * 0.08, type: 'spring', stiffness: 200, damping: 22 }}
      style={{
        background: cfg.gradient,
        borderRadius: 24,
        border: `1px solid ${removing ? 'rgba(239,68,68,0.4)' : cfg.border}`,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: `0 4px 40px ${cfg.color}18`,
        pointerEvents: removing ? 'none' : 'auto',
      }}
    >
      {/* Holographic shimmer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}66)`,
      }} />

      <div style={{ padding: '28px 28px 20px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          {/* Left: ticket info */}
          <div style={{ flex: 1, minWidth: 260 }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
                Digital Ticket
              </span>
              <span style={{
                padding: '3px 10px',
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 100,
                fontSize: 10, fontWeight: 700,
                color: cfg.color, letterSpacing: 1,
              }}>
                {cfg.label}
              </span>
              <span style={{
                padding: '3px 10px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 100,
                fontSize: 10, fontWeight: 600,
                color: '#10B981',
              }}>
                ✓ Confirmed
              </span>
              <CountdownBadge expiresAt={booking.expiresAt} onExpired={handleExpired} />
            </div>

            <h3 style={{
              fontSize: 22, fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              marginBottom: 4, color: '#fff',
            }}>
              {booking.event?.title || 'AI Summit 2027'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 18 }}>
              {[
                { icon: FiCalendar, text: formatDate(booking.event?.dateTime?.startDate) },
                { icon: FiMapPin, text: `${booking.event?.venue?.city || 'San Francisco'}, ${booking.event?.venue?.country || 'CA'}` },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0b8' }}>
                  <Icon size={13} color="#818cf8" /> {text}
                </div>
              ))}
            </div>

            {/* Ticket details grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '10px 24px',
              padding: '16px 18px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: 16,
            }}>
              {[
                { label: 'Ticket #', value: booking.ticketNumber },
                { label: 'Booking ID', value: booking.bookingId?.substring(0, 8).toUpperCase() + '...' },
                { label: 'Name', value: booking.user?.name || '—' },
                { label: 'Email', value: booking.user?.email || '—' },
                { label: 'Price', value: booking.price === 0 ? 'FREE' : `$${booking.price}` },
                { label: 'Payment', value: booking.paymentStatus === 'free' ? 'Free' : 'Paid ✓' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: '#606080', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0f0', wordBreak: 'break-all' }}>{value}</div>
                </div>
              ))}
            </div>

            {booking.transactionId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a0a0b8' }}>
                <FiCreditCard size={11} color="#818cf8" />
                Transaction: <span style={{ color: '#818cf8', fontFamily: 'monospace' }}>{booking.transactionId}</span>
              </div>
            )}
          </div>

          {/* Right: QR Code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              padding: 12,
              background: '#fff',
              borderRadius: 16,
              boxShadow: `0 0 30px ${cfg.color}44`,
            }}>
              <QRCodeSVG
                value={qrValue}
                size={120}
                bgColor="#ffffff"
                fgColor="#0B0B16"
                level="M"
              />
            </div>
            <div style={{ fontSize: 10, color: '#606080', textAlign: 'center', letterSpacing: 0.5 }}>
              SCAN TO VERIFY
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: cfg.color,
              fontFamily: 'monospace', letterSpacing: 1,
            }}>
              {booking.ticketNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Perforated divider */}
      <div style={{
        margin: '0 28px',
        borderTop: '1.5px dashed rgba(255,255,255,0.08)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', left: -40, top: -10, width: 20, height: 20, borderRadius: '50%', background: '#050816' }} />
        <div style={{ position: 'absolute', right: -40, top: -10, width: 20, height: 20, borderRadius: '50%', background: '#050816' }} />
      </div>

      {/* Footer actions */}
      <div style={{ padding: '14px 36px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: `0 4px 20px ${cfg.color}44` }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px',
            background: `linear-gradient(135deg, ${cfg.color}22, ${cfg.color}11)`,
            border: `1px solid ${cfg.border}`,
            borderRadius: 10, cursor: 'pointer',
            color: cfg.color, fontSize: 13, fontWeight: 600,
          }}
        >
          <FiDownload size={13} /> Download PDF
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, cursor: 'pointer',
            color: '#a0a0b8', fontSize: 13, fontWeight: 600,
          }}
        >
          <FiShare2 size={13} /> Share
        </motion.button>

        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#606080' }}>
          Booked {new Date(booking.createdAt).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
}

const MyTickets = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const handleExpired = (id: string) => {
    setBookings((prev) => prev.filter((b) => b._id !== id));
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await API.get<Booking[]>('/my-ticket');
      setBookings(data);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  return (
    <section style={{ paddingTop: 100, minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          {/* Back to Home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.04, x: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, cursor: 'pointer',
                  color: '#a0a0b8', fontSize: 13, fontWeight: 600,
                }}
              >
                <FiArrowLeft size={13} /> Back to Home
              </motion.div>
            </Link>
            <Link to="/events" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.08))',
                  border: '1px solid rgba(79,70,229,0.25)',
                  borderRadius: 10, cursor: 'pointer',
                  color: '#818cf8', fontSize: 13, fontWeight: 600,
                }}
              >
                <FiHome size={13} /> Browse Events
              </motion.div>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 800, marginBottom: 6 }}>
                My Tickets
              </h1>
              <p style={{ fontSize: 14, color: '#a0a0b8' }}>
                {bookings.length > 0 ? `${bookings.length} ticket${bookings.length > 1 ? 's' : ''} found` : 'Your event passes and digital tickets'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchTickets}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px',
                background: 'rgba(79,70,229,0.1)',
                border: '1px solid rgba(79,70,229,0.25)',
                borderRadius: 10, cursor: 'pointer',
                color: '#818cf8', fontSize: 13, fontWeight: 600,
              }}
            >
              <FiRefreshCw size={13} /> Refresh
            </motion.button>
          </div>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[1, 2].map((i) => (
              <div key={i} style={{
                height: 220, borderRadius: 24,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                overflow: 'hidden', position: 'relative',
              }}>
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(79,70,229,0.06), transparent)',
                  }}
                />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center', padding: '80px 40px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎫</div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
              No tickets yet
            </h3>
            <p style={{ fontSize: 14, color: '#a0a0b8', marginBottom: 28 }}>
              Book your first event ticket to see it here
            </p>
            <a href="/events" className="btn btn-primary" style={{ padding: '12px 28px' }}>
              Browse Events
            </a>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <AnimatePresence>
              {bookings.map((booking, i) => (
                <TicketCard key={booking._id} booking={booking} index={i} onExpired={handleExpired} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyTickets;
