import { ReactNode } from 'react';

interface AnimatedBackgroundProps {
  children: ReactNode;
}

const AnimatedBackground = ({ children }: AnimatedBackgroundProps) => {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background gradient layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, #030712, rgba(49, 46, 129, 0.6), #030712)',
          zIndex: 0,
        }}
      />

      {/* Aurora Wave 1 - Blue indigo glow top center */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.6,
          background:
            "radial-gradient(ellipse 900px 600px at 50% 20%, rgba(59,130,246,0.35) 0%, transparent 60%)",
          animation: "aurora1 12s ease-in-out infinite alternate",
          zIndex: 1,
          pointerEvents: 'none',
        } as React.CSSProperties}
      />

      {/* Aurora Wave 2 - Indigo glow right */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.5,
          background:
            "radial-gradient(ellipse 800px 500px at 80% 30%, rgba(99,102,241,0.30) 0%, transparent 60%)",
          animation: "aurora2 10s ease-in-out infinite alternate-reverse",
          zIndex: 1,
          pointerEvents: 'none',
        } as React.CSSProperties}
      />

      {/* Aurora Wave 3 - Purple glow bottom left */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
          background:
            "radial-gradient(ellipse 700px 500px at 20% 70%, rgba(139,92,246,0.25) 0%, transparent 60%)",
          animation: "aurora3 15s ease-in-out infinite alternate",
          zIndex: 1,
          pointerEvents: 'none',
        } as React.CSSProperties}
      />

      {/* Aurora Wave 4 - Cyan glow bottom right */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.3,
          background:
            "radial-gradient(ellipse 1000px 400px at 60% 80%, rgba(6,182,212,0.20) 0%, transparent 60%)",
          animation: "aurora4 14s ease-in-out infinite alternate-reverse",
          zIndex: 1,
          pointerEvents: 'none',
        } as React.CSSProperties}
      />

      {/* Premium multi-glow layer */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
          background: `
            radial-gradient(circle at 30% 30%, rgba(99,102,241,0.15), transparent 40%),
            radial-gradient(circle at 70% 60%, rgba(59,130,246,0.15), transparent 40%),
            radial-gradient(circle at 50% 90%, rgba(6,182,212,0.10), transparent 50%)
          `,
          zIndex: 1,
          pointerEvents: 'none',
        } as React.CSSProperties}
      />

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;