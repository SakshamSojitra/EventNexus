import { motion } from 'framer-motion';
import { FiCpu, FiZap, FiTrendingUp, FiMonitor, FiMusic, FiActivity, FiBriefcase, FiPenTool } from 'react-icons/fi';

const categories = [
  { name: 'Technology', icon: FiCpu, color: '#4F46E5', desc: 'Latest tech trends & innovations' },
  { name: 'AI', icon: FiZap, color: '#7C3AED', desc: 'Artificial intelligence & ML' },
  { name: 'Startups', icon: FiTrendingUp, color: '#06B6D4', desc: 'Entrepreneurship & growth' },
  { name: 'Gaming', icon: FiMonitor, color: '#EC4899', desc: 'Gaming & esports' },
  { name: 'Music', icon: FiMusic, color: '#10B981', desc: 'Live music & festivals' },
  { name: 'Sports', icon: FiActivity, color: '#F59E0B', desc: 'Sports events & tournaments' },
  { name: 'Business', icon: FiBriefcase, color: '#EF4444', desc: 'Business & networking' },
  { name: 'Design', icon: FiPenTool, color: '#8B5CF6', desc: 'Design & creativity' },
];

const Categories = () => {
  return (
    <section className="section" id="categories">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <div style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Browse Categories
          </div>
          <h2 className="section-title">Explore by Category</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Find events tailored to your interests across various categories
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              style={{
                padding: 28,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '100%',
                  height: '100%',
                  background: `radial-gradient(circle, ${cat.color}15, transparent)`,
                  transition: 'all 0.3s ease',
                }}
              />
              <cat.icon style={{ fontSize: 28, color: cat.color, marginBottom: 16 }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                {cat.name}
              </h3>
              <p style={{ fontSize: 13, color: '#a0a0b8', lineHeight: 1.5 }}>{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;