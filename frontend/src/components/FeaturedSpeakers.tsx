import { motion } from 'framer-motion';
import { FiLinkedin, FiTwitter } from 'react-icons/fi';

const speakers = [
  { name: 'Elon Musk', title: 'CEO', company: 'Tesla & SpaceX', avatar: 'E', color: '#4F46E5' },
  { name: 'Sam Altman', title: 'CEO', company: 'OpenAI', avatar: 'S', color: '#7C3AED' },
  { name: 'Satya Nadella', title: 'CEO', company: 'Microsoft', avatar: 'S', color: '#06B6D4' },
  { name: 'Sundar Pichai', title: 'CEO', company: 'Google', avatar: 'S', color: '#EC4899' },
];

const FeaturedSpeakers = () => (
  <section className="section">
    <div className="container">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ textAlign: 'center', marginBottom: 60 }}
      >
        <div style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Featured Speakers</div>
        <h2 className="section-title">Meet Your Speakers</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>Industry leaders sharing insights and experiences</p>
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
        {speakers.map((speaker, i) => (
          <motion.div
            key={speaker.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            style={{
              padding: 32,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `linear-gradient(135deg, ${speaker.color}, ${speaker.color}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 700, margin: '0 auto 20px',
              boxShadow: `0 0 30px ${speaker.color}44`,
            }}>
              {speaker.avatar}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>{speaker.name}</h3>
            <div style={{ fontSize: 13, color: speaker.color, marginBottom: 4 }}>{speaker.title}</div>
            <div style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 16 }}>{speaker.company}</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <FiLinkedin size={16} style={{ color: '#a0a0b8', cursor: 'pointer' }} />
              <FiTwitter size={16} style={{ color: '#a0a0b8', cursor: 'pointer' }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedSpeakers;