import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiUsers, FiTrendingUp, FiFilter } from 'react-icons/fi';
import API from '../utils/api';
import { MOCK_EVENTS, CATEGORIES, MockEvent } from '../data/mockEvents';

const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#EC4899', '#10B981', '#F59E0B'];

const CATEGORY_IMAGES: Record<string, string> = {
  ai: 'https://media.istockphoto.com/id/2222990006/photo/artificial-intelligence-machine-learning-large-language-model-ai-technology.webp?a=1&b=1&s=612x612&w=0&k=20&c=T28GEzXtmmie0RbPJAn6MDncUJpQzqaqoSimSjLBBv0=',
  technology: 'https://plus.unsplash.com/premium_photo-1733353272493-04c4abfd3c43?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y3JlYXRpdmUlMjB0ZWNobm9sb2d5fGVufDB8fDB8fHww',
  startups: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c3RhcnR1cCUyMG1lZXRpbmd8ZW58MHx8MHx8fDA%3D',
  gaming: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2FtaW5nfGVufDB8fDB8fHww',
  music: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bXVzaWMlMjBmZXN0aXZhbHxlbnwwfHwwfHx8MA%3D%3D',
  sports: 'https://media.istockphoto.com/id/2020169093/photo/beautiful-sports-stadium-with-a-green-grass-field-shines-with-blue-spotlights-at-night-with.webp?a=1&b=1&s=612x612&w=0&k=20&c=46Ap44sp9RTwkuYF4rEkbbqnE6lRVA80woRPCevVgqI=',
  business: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJ1c2luZXNzJTIwbWVldGluZ3xlbnwwfHwwfHx8MA%3D%3D',
  design: 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZGVzaWduJTIwd29ya3Nob3B8ZW58MHx8MHx8fDA%3D',
};

const EventCard = ({ event, index }: { event: MockEvent; index: number }) => {
  const color = COLORS[index % COLORS.length];
  const [hovered, setHovered] = useState(false);
  const imgSrc = event.banner || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.ai;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.3s ease',
      }}
    >
      <Link to={`/event/${event._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div
          style={{
            height: 220,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={imgSrc}
            alt={event.category}
            loading="lazy"
            decoding="async"
            className="w-full h-[220px] object-cover transition-all duration-500 group-hover:scale-110"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
              filter: hovered ? 'brightness(1.08)' : 'brightness(1)',
              transition: 'transform 0.5s ease, filter 0.5s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(5,8,20,0.15) 0%, rgba(5,8,20,0.35) 40%, rgba(5,8,20,0.65) 75%, rgba(5,8,20,0.90) 100%)',
            }}
          />
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
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              background: 'rgba(239,68,68,0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: 100,
              fontSize: 11,
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            Live
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color, marginBottom: 8, fontWeight: 500 }}>
            {new Date(event.dateTime.startDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
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
                }}
              >
                ${event.price}
              </span>
              <span style={{ fontSize: 12, color: '#a0a0b8', marginLeft: 4 }}>/ ticket</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#10B981' }}>
              <FiTrendingUp size={14} />
              {event.popularity}%
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Events = () => {
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (category !== 'all') params.category = category;

        const { data } = await API.get('/events', { params });
        if (data.events?.length > 0) {
          const mapped = data.events.map((e: Record<string, unknown>) => ({
            _id: e._id as string,
            title: e.title as string,
            category: e.category as string,
            location: `${(e.venue as { city?: string })?.city || ''}, ${(e.venue as { country?: string })?.country || ''}`,
            price: (e.tickets as { price?: number }[])?.[0]?.price ?? 0,
            popularity: (e.popularity as number) ?? 0,
            attendees: (e.attendees as unknown[])?.length ?? 0,
            banner: (e.banner as string) ?? '',
            dateTime: { startDate: (e.dateTime as { startDate?: string })?.startDate ?? '' },
          }));
          setEvents(mapped);
        } else {
          setEvents(MOCK_EVENTS);
        }
      } catch {
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || event.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <section style={{ paddingTop: 100, minHeight: '100vh', paddingBottom: 60 }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40 }}
        >
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
            Discover
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 40,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Explore Events
          </h1>
          <p style={{ fontSize: 15, color: '#a0a0b8', maxWidth: 560 }}>
            Browse and discover amazing events happening around the world. Filter by category or search for your next experience.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <FiSearch size={18} color="#a0a0b8" />
            <input
              type="text"
              placeholder="Search events by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <FiFilter size={14} color="#a0a0b8" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: category === cat ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : 'rgba(255,255,255,0.04)',
                  color: category === cat ? '#fff' : '#a0a0b8',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                }}
              >
                {cat === 'all' ? 'All Events' : cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Events Grid */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 380,
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <p style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 20 }}>
              Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 20,
              }}
            >
              {filteredEvents.map((event, index) => (
                <EventCard key={event._id} event={event} index={index} />
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, marginBottom: 8 }}>
              No events found
            </h3>
            <p style={{ fontSize: 14, color: '#a0a0b8' }}>
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Events;
