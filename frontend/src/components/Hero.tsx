import { useRef, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPlay } from 'react-icons/fi';

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }> = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 70, 229, ${p.opacity})`;
        ctx.fill();

        // Connect nearby particles
        particles.forEach((p2, j) => {
          if (i === j) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(79, 70, 229, ${0.1 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

const Globe3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotation = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 600;

    const globeRadius = 200;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Generate globe dots
    const dots: Array<{ lat: number; lng: number; size: number }> = [];
    for (let i = 0; i < 300; i++) {
      dots.push({
        lat: (Math.random() - 0.5) * Math.PI,
        lng: Math.random() * Math.PI * 2,
        size: Math.random() * 3 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rotation.current += 0.005;

      // Draw glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, globeRadius + 50);
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.1)');
      gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.05)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius + 50, 0, Math.PI * 2);
      ctx.fill();

      // Draw grid lines
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.15)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i <= 12; i++) {
        const lat = (i / 12) * Math.PI - Math.PI / 2;
        ctx.beginPath();
        for (let j = 0; j <= 60; j++) {
          const lng = (j / 60) * Math.PI * 2 + rotation.current;
          const x = centerX + globeRadius * Math.cos(lat) * Math.sin(lng);
          const y = centerY - globeRadius * Math.sin(lat);
          // Only draw front half
          const z = globeRadius * Math.cos(lat) * Math.cos(lng);
          if (z > 0) {
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw longitude lines
      for (let i = 0; i <= 12; i++) {
        const lng = (i / 12) * Math.PI * 2 + rotation.current;
        ctx.beginPath();
        for (let j = 0; j <= 30; j++) {
          const lat = (j / 30) * Math.PI - Math.PI / 2;
          const x = centerX + globeRadius * Math.cos(lat) * Math.sin(lng);
          const y = centerY - globeRadius * Math.sin(lat);
          const z = globeRadius * Math.cos(lat) * Math.cos(lng);
          if (z > 0) {
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw dots
      dots.forEach((dot) => {
        const lng = dot.lng + rotation.current;
        const x = centerX + globeRadius * Math.cos(dot.lat) * Math.sin(lng);
        const y = centerY - globeRadius * Math.sin(dot.lat);
        const z = globeRadius * Math.cos(dot.lat) * Math.cos(lng);

        if (z > 0) {
          const opacity = z / globeRadius;
          ctx.beginPath();
          ctx.arc(x, y, dot.size * opacity, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(6, 182, 212, ${opacity * 0.8})`;
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: 400,
        height: 400,
        maxWidth: '100%',
        filter: 'drop-shadow(0 0 80px rgba(79, 70, 229, 0.3))',
      }}
    />
  );
};

const Hero = () => {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: 80,
      }}
    >
      {/* Background layers */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, #050816 0%, #0a0a1a 50%, #050816 100%)
          `,
        }}
      />

      {/* Aurora gradient */}
      <div
        className="aurora-gradient"
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
        }}
      />
      <div
        className="aurora-gradient"
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '30%',
          height: '30%',
          borderRadius: '50%',
        }}
      />

      {/* Particles */}
      <ParticleField />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          alignItems: 'center',
        }}
      >
        {/* Left side - Text */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                background: 'rgba(79, 70, 229, 0.1)',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                borderRadius: 100,
                fontSize: 13,
                color: '#818cf8',
                marginBottom: 24,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F46E5' }} />
              Powered by Advanced AI
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: 24,
            }}
          >
            The Future of{' '}
            <span
              className="text-gradient"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Events
            </span>{' '}
            Starts Here
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              fontSize: 18,
              color: '#a0a0b8',
              lineHeight: 1.6,
              maxWidth: 500,
              marginBottom: 40,
            }}
          >
            Discover, Create, Attend and Experience Extraordinary Events Powered by AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
          >
            <Link
              to="/events"
              className="btn btn-primary btn-lg"
              style={{
                padding: '18px 36px',
                fontSize: 16,
                borderRadius: 12,
                gap: 12,
              }}
            >
              Explore Events <FiArrowRight />
            </Link>
            <Link
              to="/create-event"
              className="btn btn-secondary btn-lg"
              style={{
                padding: '18px 36px',
                fontSize: 16,
                borderRadius: 12,
                gap: 12,
              }}
            >
              Create Event
            </Link>
            <button
              className="btn btn-secondary btn-lg"
              style={{
                padding: '18px 36px',
                fontSize: 16,
                borderRadius: 12,
                gap: 12,
              }}
              onClick={() => window.open('https://www.youtube.com/watch?v=d77TQupCENc', '_blank', 'noopener,noreferrer')}
            >
              <FiPlay /> Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              display: 'flex',
              gap: 40,
              marginTop: 60,
              paddingTop: 40,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {[
              { value: '10K+', label: 'Active Events' },
              { value: '50K+', label: 'Happy Attendees' },
              { value: '500+', label: 'Organizers' },
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span className="text-gradient">{stat.value}</span>
                </div>
                <div style={{ fontSize: 13, color: '#a0a0b8', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right side - 3D Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />
          <Globe3D />

          {/* Floating cards */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '15%',
              right: '5%',
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              fontSize: 13,
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span>1,234 attending now</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{
              position: 'absolute',
              bottom: '20%',
              left: '5%',
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              fontSize: 13,
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06B6D4' }} />
              <span>AI Recommended for you</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;