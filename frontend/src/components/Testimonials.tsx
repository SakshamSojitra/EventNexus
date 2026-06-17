import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  { name: 'Sarah Johnson', role: 'Event Organizer', avatar: 'S', text: 'Event Nexus AI transformed how I organize events. The AI recommendations alone saved me hours of planning time.', rating: 5 },
  { name: 'Mike Chen', role: 'Tech Professional', avatar: 'M', text: 'The networking features are incredible. I connected with 15+ industry professionals at my last event!', rating: 5 },
  { name: 'Emily Rodriguez', role: 'Startup Founder', avatar: 'E', text: 'Finding relevant events has never been easier. The platform understands my interests perfectly.', rating: 5 },
  { name: 'Alex Kim', role: 'Marketing Director', avatar: 'A', text: 'The analytics dashboard gives us incredible insights into attendee engagement and event performance.', rating: 5 },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  return (
    <section className="section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <div style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Testimonials</div>
          <h2 className="section-title">What People Say</h2>
        </motion.div>

        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', minHeight: 300 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 24,
                padding: 48,
                border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 700, margin: '0 auto 24px',
              }}>
                {testimonials[current].avatar}
              </div>
              <p style={{ fontSize: 18, lineHeight: 1.7, color: '#c0c0d0', marginBottom: 24, fontStyle: 'italic' }}>
                "{testimonials[current].text}"
              </p>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{testimonials[current].name}</h4>
              <div style={{ fontSize: 13, color: '#a0a0b8' }}>{testimonials[current].role}</div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 16 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#F59E0B', fontSize: 18 }}>★</span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: 10, height: 10, borderRadius: '50%',
                  border: 'none', cursor: 'pointer',
                  background: i === current ? '#4F46E5' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;