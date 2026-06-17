import { motion } from 'framer-motion';

const sponsors = ['Google', 'Microsoft', 'OpenAI', 'Meta', 'Amazon', 'Apple'];

const Sponsors = () => (
  <section className="section" style={{ padding: '60px 0' }}>
    <div className="container">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: 13, color: '#a0a0b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 32 }}>
          Trusted by Industry Leaders
        </div>
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {sponsors.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              style={{
                fontSize: 22, fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'rgba(255,255,255,0.15)',
                letterSpacing: 1,
                transition: 'color 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.15)'}
            >
              {s}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default Sponsors;