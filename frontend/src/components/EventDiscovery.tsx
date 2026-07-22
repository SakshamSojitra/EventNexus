import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiMapPin, FiUsers } from 'react-icons/fi';

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

const MOCK_EVENTS = [
  { _id: '1', title: 'AI Summit 2026',          category: 'ai',         location: 'Bengaluru, Karnataka', price: 299, popularity: 95, attendees: 1500,  banner: '', dateTime: { startDate: '2027-03-15' } },
  { _id: '2', title: 'Tech Conference Global',   category: 'technology', location: 'Hyderabad, Telangana',        price: 599, popularity: 92, attendees: 3000,  banner: '', dateTime: { startDate: '2027-04-20' } },
  { _id: '3', title: 'Startup Pitch Night',      category: 'startups',   location: 'Pune, Maharashtra',      price: 49,  popularity: 88, attendees: 500,   banner: '', dateTime: { startDate: '2027-02-10' } },
  { _id: '4', title: 'Gaming Expo 2027',         category: 'gaming',     location: 'Mumbai, Maharashtra',      price: 199, popularity: 85, attendees: 5000,  banner: '', dateTime: { startDate: '2027-06-05' } },
  { _id: '5', title: 'Music Festival',           category: 'music',      location: 'Goa',         price: 149, popularity: 82, attendees: 10000, banner: '', dateTime: { startDate: '2027-05-22' } },
  { _id: '6', title: 'Sports Innovation Forum',  category: 'sports',     location: 'Ahmedabad, Gujarat',        price: 449, popularity: 78, attendees: 2000,  banner: '', dateTime: { startDate: '2027-07-10' } },
  { _id: '7', title: 'Business Leadership Summit',  category: 'business',     location: 'New Delhi, Delhi',        price: 349, popularity: 89, attendees: 2000,  banner: '', dateTime: { startDate: '2027-08-18' } },
  { _id: '8', title: 'Design & Creativity Workshop',  category: 'design',     location: 'Jaipur, Rajasthan',        price: 99, popularity: 83, attendees: 350,  banner: '', dateTime: { startDate: '2027-09-05' } },
];

const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#EC4899', '#10B981', '#F59E0B'];

const EventCard = ({ event, index }: { event: typeof MOCK_EVENTS[0]; index: number }) => {
  const [hovered, setHovered] = useState(false);
  const color = COLORS[index % COLORS.length];
  const imgSrc = event.banner || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.ai;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group"
      style={{
        minWidth: 320, maxWidth: 320,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 16, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer', flexShrink: 0,
        transition: 'all 0.3s ease',
      }}
    >
      <Link to={`/event/${event._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>

        {/* ── Image section ── */}
        <div style={{ height: 220, position: 'relative', overflow: 'hidden' }}>
          <img
            src={imgSrc}
            alt={event.category}
            loading="lazy"
            decoding="async"
            className="w-full h-[220px] object-cover transition-all duration-500 group-hover:scale-110"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', display: 'block',
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
              filter: hovered ? 'brightness(1.08)' : 'brightness(1)',
              transition: 'transform 0.5s ease, filter 0.5s ease',
            }}
          />

          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(5,8,20,0.15) 0%, rgba(5,8,20,0.35) 40%, rgba(5,8,20,0.65) 75%, rgba(5,8,20,0.90) 100%)',
          }} />

          {/* Category badge */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            padding: '4px 12px',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: 100, fontSize: 11,
            color: '#fff', textTransform: 'capitalize',
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            {event.category}
          </div>

          {/* Live/Upcoming badge */}
          {(() => {
            const eventDate = new Date(event.dateTime.startDate).toDateString();
            const today = new Date().toDateString();
            const isLive = eventDate === today;
            return (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px',
                background: isLive ? 'rgba(239,68,68,0.2)' : 'rgba(79,70,229,0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: 100, fontSize: 11,
                color: isLive ? '#ef4444' : '#818cf8',
                border: isLive ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(79,70,229,0.25)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: isLive ? '#ef4444' : '#818cf8',
                }} />
                {isLive ? 'Live' : 'Upcoming'}
              </div>
            );
          })()}
        </div>

        {/* ── Card body (unchanged) ── */}
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color, marginBottom: 8, fontWeight: 500 }}>
            {new Date(event.dateTime.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>

          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 12, lineHeight: 1.3 }}>
            {event.title}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0b8' }}>
              <FiMapPin size={12} /> {event.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0b8' }}>
              <FiUsers size={12} /> {event.attendees.toLocaleString()} attendees
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>
                ₹{event.price}
              </span>
              {event.price > 0 && <span style={{ fontSize: 12, color: '#a0a0b8', marginLeft: 4 }}>/ ticket</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#10B981' }}>
              <FiTrendingUp size={14} /> {event.popularity}%
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Trending Now
              </div>
              <h2 className="section-title">Discover Events</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >←</button>
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >→</button>
            </div>
          </div>
          <p className="section-subtitle">Trending events with high engagement and amazing experiences</p>
        </motion.div>

        <div
          ref={scrollRef}
          className="hide-scrollbar"
          style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 20, scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {MOCK_EVENTS.map((event, index) => (
            <EventCard key={event._id} event={event} index={index} />
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: '.hide-scrollbar::-webkit-scrollbar { display: none; }' }} />
    </section>
  );
};

export default EventDiscovery;
