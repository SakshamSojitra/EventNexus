import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiClock, FiUsers, FiShare2, FiHeart, FiCheck, FiUser, FiTag } from 'react-icons/fi';
import { useStore } from '../store/useStore';
import { useBooking, TicketType } from '../hooks/useBooking';
import BookingModal from '../components/BookingModal';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { MOCK_EVENTS } from '../data/mockEvents';

const DEFAULT_DESCRIPTION = 'No description available for this event. Check back later for more details about the agenda, speakers, and activities planned.';

const CATEGORY_HIGHLIGHTS: Record<string, string[]> = {
  technology: ['Cutting-edge tech showcases', 'Industry expert panels', 'Live demonstrations'],
  ai: ['AI research presentations', 'Hands-on ML workshops', 'Networking with AI leaders'],
  startups: ['Investor pitch sessions', 'Startup showcase', 'Mentorship opportunities'],
  gaming: ['Game demos & trials', 'Esports tournaments', 'Developer meetups'],
  music: ['Live performances', 'Artist meet & greets', 'Music production workshops'],
  sports: ['Athlete sessions', 'Sports tech demos', 'Networking with industry pros'],
  business: ['Leadership talks', 'Business strategy panels', 'Networking sessions'],
  design: ['Design workshops', 'Portfolio reviews', 'Creative collaboration sessions'],
  health: ['Wellness workshops', 'Health tech demos', 'Expert health talks'],
  education: ['Skill-building workshops', 'Educational panels', 'Learning resources'],
};

interface TicketOption {
  type: TicketType;
  name: string;
  price: number;
  label: string;
  desc: string;
  perks: string[];
  color: string;
  gradient: string;
  border: string;
}

const EventDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useStore();
  const [selectedTicket, setSelectedTicket] = useState<TicketType | ''>('');
  const { phase, loadingText, progress, booking, error, bookTicket, goToTicket, reset } = useBooking();
  const [event, setEvent] = useState<any>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Scroll to top on every navigation and clear previous event state
  useEffect(() => {
    window.scrollTo(0, 0);
    setEvent(null);
    setSelectedTicket('');
    setLoadingEvent(true);
  }, [id]);

  const venue = event?.venue;
  const organizer = event?.organizer;
  // Location for hero: use city + country only (consistent with Event Card which shows "city, country")
  const eventLocation = venue
    ? [venue.city, venue.country].filter(Boolean).join(', ')
    : '';
  // Full address for venue detail card: includes venue name + address + city + country
  const fullAddress = venue
    ? [venue.name, venue.address, venue.city, venue.country].filter(Boolean).join(', ')
    : '';
  const attendeeCount = event?.attendees?.length ?? event?.bookingCount ?? 0;
  const categoryLabel = event?.category ?? 'Event';
  const description = event?.description?.trim() ? event.description : null;

  // Build dynamic ticket options from event data, ensuring a FREE ticket always exists
  const buildTickets = (): TicketOption[] => {
    const eventTickets = event?.tickets ?? [];
    const tickets: TicketOption[] = [];

    const makeOption = (type: TicketType, name: string, price: number, desc: string, perks: string[]): TicketOption => {
      const colorMap: Record<TicketType, string> = { free: '#10B981', premium: '#4F46E5', vip: '#F59E0B' };
      const borderMap: Record<TicketType, string> = { free: 'rgba(16,185,129,0.25)', premium: 'rgba(79,70,229,0.3)', vip: 'rgba(245,158,11,0.3)' };
      const gradientMap: Record<TicketType, string> = { free: 'rgba(16,185,129,0.08)', premium: 'rgba(79,70,229,0.08)', vip: 'rgba(245,158,11,0.08)' };
      return {
        type, name, price,
        label: price === 0 ? 'FREE' : `₹${price}`,
        desc,
        perks,
        color: colorMap[type],
        border: borderMap[type],
        gradient: gradientMap[type],
      };
    };

    // 1. Always add a FREE ticket
    tickets.push(makeOption('free', 'Free Pass', 0, 'Complimentary access to the event', ['Main event access', 'Networking area']));

    // 2. Check if event has premium/vip tickets from DB
    const hasPremium = eventTickets.some((t: any) => t.type === 'premium' || t.type === 'general');
    const hasVip = eventTickets.some((t: any) => t.type === 'vip');

    if (hasPremium || hasVip) {
      if (hasPremium) {
        const dbPremium = eventTickets.find((t: any) => t.type === 'premium' || t.type === 'general');
        tickets.push(makeOption('premium', dbPremium?.name ?? 'Premium Pass', dbPremium?.price ?? 299, dbPremium?.description ?? 'Enhanced access with additional perks', dbPremium?.benefits ?? ['Everything in Free', 'All workshops', 'Speaker meet & greet', 'Premium swag bag']));
      }
      if (hasVip) {
        const dbVip = eventTickets.find((t: any) => t.type === 'vip');
        tickets.push(makeOption('vip', dbVip?.name ?? 'VIP Experience', dbVip?.price ?? 599, dbVip?.description ?? 'Ultimate VIP treatment', dbVip?.benefits ?? ['Everything in Premium', 'VIP lounge access', 'Private dinner', 'Front-row seating', 'Exclusive afterparty']));
      }
    } else {
      // If no premium/vip from DB, still show them as options with event's base price
      const basePrice = eventTickets.length > 0 ? Math.min(...eventTickets.map((t: any) => t.price).filter((p: number) => p > 0)) : 299;
      tickets.push(makeOption('premium', 'Premium Pass', basePrice || 299, 'Enhanced access with additional perks', ['Everything in Free', 'All workshops', 'Speaker meet & greet', 'Premium swag bag']));
      tickets.push(makeOption('vip', 'VIP Experience', Math.round((basePrice || 299) * 2), 'Ultimate VIP treatment', ['Everything in Premium', 'VIP lounge access', 'Private dinner', 'Front-row seating', 'Exclusive afterparty']));
    }

    return tickets;
  };

  const tickets = event ? buildTickets() : [];

  useEffect(() => {
    if (!id) return;

    // Check if id looks like a mock-event ID (short numeric string)
    const isMockId = /^\d+$/.test(id);
    if (isMockId) {
      const mockEvent = MOCK_EVENTS.find((m) => m._id === id);
      if (mockEvent) {
        // Build a partial event object with location matching the Event Card format
        setEvent({
          _id: id,
          title: mockEvent.title,
          category: mockEvent.category,
          description: `Join us for ${mockEvent.title} in ${mockEvent.location}. Experience an unforgettable event featuring industry leaders, cutting-edge insights, and unparalleled networking opportunities.`,
          venue: {
            name: mockEvent.location,
            city: mockEvent.location,
            country: '',
            address: '',
          },
          dateTime: { startDate: mockEvent.dateTime.startDate, endDate: mockEvent.dateTime.startDate, startTime: '09:00 AM', endTime: '06:00 PM' },
          capacity: mockEvent.attendees,
          tickets: [
            { type: 'free', name: 'Free Pass', price: 0, quantity: 500, sold: 0, description: 'Complimentary access to the event', benefits: ['Main event access', 'Networking area'] },
            { type: 'premium', name: 'Premium Pass', price: mockEvent.price, quantity: 1000, sold: 0, description: 'Enhanced access with additional perks', benefits: ['Everything in Free', 'All workshops', 'Speaker meet & greet', 'Premium swag bag'] },
            { type: 'vip', name: 'VIP Experience', price: mockEvent.price * 2, quantity: 200, sold: 0, description: 'Ultimate VIP treatment', benefits: ['Everything in Premium', 'VIP lounge access', 'Private dinner', 'Front-row seating', 'Exclusive afterparty'] },
          ],
          bookingCount: 0,
          popularity: mockEvent.popularity,
          organizer: null,
        });
        setLoadingEvent(false);
        return;
      }
    }

    API.get(`/events/${id}`)
      .then(({ data }) => {
        setEvent(data.event ?? data);
      })
      .catch(() => {
        // If API fails, try to find a matching mock event as fallback
        const mockEvent = MOCK_EVENTS.find((m) => m._id === id);
        if (mockEvent) {
          setEvent({
            _id: id,
            title: mockEvent.title,
            category: mockEvent.category,
            description: `Join us for ${mockEvent.title} in ${mockEvent.location}. Experience an unforgettable event featuring industry leaders, cutting-edge insights, and unparalleled networking opportunities.`,
            venue: {
              name: mockEvent.location,
              city: mockEvent.location,
              country: '',
              address: '',
            },
            dateTime: { startDate: mockEvent.dateTime.startDate, endDate: mockEvent.dateTime.startDate, startTime: '09:00 AM', endTime: '06:00 PM' },
            capacity: mockEvent.attendees,
            tickets: [
              { type: 'free', name: 'Free Pass', price: 0, quantity: 500, sold: 0, description: 'Complimentary access to the event', benefits: ['Main event access', 'Networking area'] },
              { type: 'premium', name: 'Premium Pass', price: mockEvent.price, quantity: 1000, sold: 0, description: 'Enhanced access with additional perks', benefits: ['Everything in Free', 'All workshops', 'Speaker meet & greet', 'Premium swag bag'] },
              { type: 'vip', name: 'VIP Experience', price: mockEvent.price * 2, quantity: 200, sold: 0, description: 'Ultimate VIP treatment', benefits: ['Everything in Premium', 'VIP lounge access', 'Private dinner', 'Front-row seating', 'Exclusive afterparty'] },
            ],
            bookingCount: 0,
            popularity: mockEvent.popularity,
            organizer: null,
          });
        } else {
          toast.error('Failed to load event');
        }
      })
      .finally(() => setLoadingEvent(false));
  }, [id]);

  const handleCheckout = async () => {
    if (!selectedTicket) return;
    if (!isAuthenticated) {
      toast.error('Please login to book a ticket');
      return;
    }
    const eventId = id || '000000000000000000000001';
    await bookTicket(eventId, selectedTicket);
  };

  const selected = tickets.find((t) => t.type === selectedTicket);

  const highlights = CATEGORY_HIGHLIGHTS[event?.category?.toLowerCase()] ?? [
    'Expert-led sessions',
    'Networking opportunities',
    'Interactive workshops',
  ];

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
        minHeight: 'clamp(350px, 40vh, 450px)',
        background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
        position: 'relative', display: 'flex', alignItems: 'flex-end',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(79,70,229,0.15), transparent)' }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(79,70,229,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: 32, paddingTop: 24 }}>
          {loadingEvent ? (
            <div style={{ minHeight: 120, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ fontSize: 14, color: '#a0a0b8' }}>Loading event...</div>
            </div>
          ) : (
            <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ padding: '4px 14px', background: 'rgba(79,70,229,0.2)', borderRadius: 100, fontSize: 12, color: '#818cf8', border: '1px solid rgba(79,70,229,0.3)' }}>
                  {categoryLabel}
                </span>
                {event?.popularity > 70 && (
                  <span style={{ padding: '4px 12px', background: 'rgba(245,158,11,0.15)', borderRadius: 100, fontSize: 11, color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' }}>
                    🔥 Trending
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, margin: '8px 0 12px', lineHeight: 1.1 }}>
                {event?.title ?? 'Event Details'}
              </h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', rowGap: 8 }}>
                {event?.dateTime?.startDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0b8' }}>
                    <FiCalendar size={14} /> {new Date(event.dateTime.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
                {event?.dateTime?.startTime && event?.dateTime?.endTime && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0b8' }}>
                    <FiClock size={14} /> {event.dateTime.startTime} – {event.dateTime.endTime}
                  </div>
                )}
                {eventLocation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0b8' }}>
                    <FiMapPin size={14} /> {eventLocation}
                  </div>
                )}
                {attendeeCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0b8' }}>
                    <FiUsers size={14} /> {attendeeCount.toLocaleString()} attendees
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="container" style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 420px', gap: 40, paddingBottom: 80 }}>
        {/* Main Content */}
        <motion.div key={`content-${id}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          {/* About Section */}
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, marginBottom: 16 }}>About This Event</h2>
          <p style={{ fontSize: 14, color: '#a0a0b8', lineHeight: 1.8, marginBottom: 28 }}>
            {description ?? DEFAULT_DESCRIPTION}
          </p>

          {/* Event Details Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
            {organizer && (
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <FiUser size={14} color="#818cf8" />
                  <span style={{ fontSize: 11, color: '#a0a0b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organizer</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{organizer.name ?? 'N/A'}</span>
                {organizer.email && <div style={{ fontSize: 12, color: '#a0a0b8', marginTop: 2 }}>{organizer.email}</div>}
              </div>
            )}
            {venue && (
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <FiMapPin size={14} color="#818cf8" />
                  <span style={{ fontSize: 11, color: '#a0a0b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Venue</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{venue.name ?? 'TBD'}</span>
                {venue.address && <div style={{ fontSize: 12, color: '#a0a0b8', marginTop: 2 }}>{fullAddress}</div>}
              </div>
            )}
            {event?.category && (
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <FiTag size={14} color="#818cf8" />
                  <span style={{ fontSize: 11, color: '#a0a0b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>{categoryLabel}</span>
              </div>
            )}
          </div>

          {/* Event Highlights */}
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Event Highlights</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
            {highlights.map((highlight, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(79,70,229,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiCheck size={12} color="#818cf8" />
                </div>
                <span style={{ fontSize: 13, color: '#c0c0d8' }}>{highlight}</span>
              </motion.div>
            ))}
          </div>

          {/* Speakers */}
          {(event?.speakers ?? []).length > 0 && (
            <>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Speakers</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {event.speakers.map((s: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                      {s.name?.[0] ?? 'S'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: '#a0a0b8' }}>{s.title}{s.company ? `, ${s.company}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Schedule */}
          {(event?.schedule ?? []).length > 0 && (
            <>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Schedule</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {event.schedule.map((s: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ display: 'flex', gap: 20, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                    {s.startTime && <div style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600, minWidth: 80, flexShrink: 0 }}>{s.startTime}{s.endTime ? ` – ${s.endTime}` : ''}</div>}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                      {s.description && <div style={{ fontSize: 12, color: '#a0a0b8', marginTop: 2 }}>{s.description}</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Sidebar – Ticket Selection */}
        <motion.div key={`tickets-${id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{
            padding: 28,
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'sticky', top: 100,
          }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Get Tickets</h3>
            <p style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 20 }}>Select your ticket type below</p>

            {tickets.map((t) => {
              const isSelected = selectedTicket === t.type;
              return (
                <motion.button key={t.type} onClick={() => { setSelectedTicket(t.type); }}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  style={{
                    width: '100%', padding: '16px 18px', marginBottom: 12,
                    background: isSelected ? t.gradient : 'rgba(255,255,255,0.02)',
                    border: isSelected ? `1.5px solid ${t.border}` : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? `0 0 20px ${t.color}22` : 'none',
                    position: 'relative',
                  }}>
                  {isSelected && (
                    <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                background: selectedTicket ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'rgba(255,255,255,0.04)',
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
                <span style={{ fontSize: 12, color: '#a0a0b8' }}>🔥 {(event?.bookingCount ?? 0).toLocaleString()} booked</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#a0a0b8' }}>👥 {event?.capacity ? Math.max(event.capacity - (event?.bookingCount ?? 0), 0).toLocaleString() : '—'} spots left</span>
                <span style={{ fontSize: 12, color: '#a0a0b8' }}>📅 {event?.dateTime?.startDate ? Math.ceil((new Date(event.dateTime.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) + ' days away' : '—'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {[{ icon: FiHeart, label: 'Save' }, { icon: FiShare2, label: 'Share' }].map(({ icon: Icon, label }) => (
                <button key={label}
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

      <style>{`
        @media (max-width: 900px) {
          .event-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .container > div:first-child > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default EventDetails;