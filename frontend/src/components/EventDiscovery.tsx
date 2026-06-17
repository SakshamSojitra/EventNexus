import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiMapPin, FiUsers } from 'react-icons/fi';

const MOCK_EVENTS = [
  {
    _id: '1',
    title: 'AI Summit 2027',
    category: 'ai',
    location: 'San Francisco, CA',
    price: 299,
    popularity: 95,
    attendees: 1500,
    banner: '',
    dateTime: { startDate: '2027-03-15' },
  },
  {
    _id: '2',
    title: 'Tech Conference Global',
    category: 'technology',
    location: 'London, UK',
    price: 599,
    popularity: 92,
    attendees: 3000,
    banner: '',
    dateTime: { startDate: '2027-04-20' },
  },
  {
    _id: '3',
    title: 'Startup Pitch Night',
    category: 'startups',
    location: 'New York, NY',
    price: 49,
    popularity: 88,
    attendees: 500,
    banner: '',
    dateTime: { startDate: '2027-02-10' },
  },
  {
    _id: '4',
    title: 'Gaming Expo 2027',
    category: 'gaming',
    location: 'Tokyo, Japan',
    price: 199,
    popularity: 85,
    attendees: 5000,
    banner: '',
    dateTime: { startDate: '2027-06-05' },
  },
  {
    _id: '5',
    title: 'Music Festival',
    category: 'music',
    location: 'Miami, FL',
    price: 149,
    popularity: 82,
    attendees: 10000,
    banner: '',
    dateTime: { startDate: '2027-05-22' },
  },
  {
    _id: '6',
    title: 'Sports Innovation Forum',
    category: 'sports',
    location: 'Dubai, UAE',
    price: 449,
    popularity: 78,
    attendees: 2000,
    banner: '',
    dateTime: { startDate: '2027-07-10' },
  },
];

const EventCard = ({ event, index }: { event: typeof MOCK_EVENTS[0]; index: number }) => {
  const colors = ['#4F46E5', '#7C3AED', '#06B6D4', '#EC4899', '#10B981', '#F59E0B'];
  const color = colors[index % colors.length];
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        minWidth: 320,
        maxWidth: 320,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        flexShrink: 0,
      }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Link to={`/event/${event._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            style={{
              height: 180,
              background: 'linear-gradient(135deg, ' + color + '33, ' + color + '11)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 30% 50%, ' + color + '22, transparent)',
            }}
          />
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              color: color + "44",
            }}
          >
            {event.category.toUpperCase()}
          </div>
          
          {/* Category Badge */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              padding: '4px 12px',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              borderRadius: 100,
              fontSize: 11,
              color: '#fff',
              textTransform: 'capitalize',
            }}
          >
            {event.category}
          </div>

          {/* Live indicator */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: 100,
              fontSize: 11,
              color: '#ef4444',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            Live
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 13,
              color: color,
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            {new Date(event.dateTime.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>

          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 12,
              lineHeight: 1.3,
            }}
          >
            {event.title}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0b8' }}>
              <FiMapPin size={12} />
              {event.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0b8' }}>
              <FiUsers size={12} />
              {event.attendees.toLocaleString()} attendees
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: '#fff',
                }}
              >
                ${event.price}
              </span>
              {event.price > 0 && (
                <span style={{ fontSize: 12, color: '#a0a0b8', marginLeft: 4 }}>/ ticket</span>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                color: '#10B981',
              }}
            >
              <FiTrendingUp size={14} />
              {event.popularity}%
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const EventDiscovery = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="section" id="events">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 48 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: '#4F46E5',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                Trending Now
              </div>
              <h2 className="section-title">Discover Events</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                ←
              </button>
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                →
              </button>
            </div>
          </div>
          <p className="section-subtitle">
            Trending events with high engagement and amazing experiences
          </p>
        </motion.div>

        {/* Netflix-style horizontal scroll */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: 20,
            overflowX: 'auto',
            paddingBottom: 20,
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="hide-scrollbar"
        >
          {MOCK_EVENTS.map((event, index) => (
            <EventCard key={event._id} event={event} index={index} />
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: '.hide-scrollbar::-webkit-scrollbar { display: none; }'
      }} />
    </section>
  );
};

export default EventDiscovery;