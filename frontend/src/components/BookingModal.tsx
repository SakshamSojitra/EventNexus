import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingPhase } from '../hooks/useBooking';

interface Props {
  phase: BookingPhase;
  loadingText: string;
  progress: number;
  ticketType: string;
  error: string;
  onViewTicket: () => void;
  onClose: () => void;
}

function Confetti() {
  const colors = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: Math.random() * 100 + '%', opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: Math.random() * 720 - 360 }}
          transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random() * 0.8, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            width: 8 + Math.random() * 8,
            height: 8 + Math.random() * 8,
            borderRadius: Math.random() > 0.5 ? '50%' : 2,
            background: colors[Math.floor(Math.random() * colors.length)],
          }}
        />
      ))}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(5,8,22,0.92)',
  backdropFilter: 'blur(16px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const cardStyle: React.CSSProperties = {
  width: '100%', maxWidth: 460,
  background: 'linear-gradient(135deg, rgba(15,15,35,0.98), rgba(10,10,26,0.98))',
  border: '1px solid rgba(79,70,229,0.3)',
  borderRadius: 24,
  padding: '48px 40px',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 0 60px rgba(79,70,229,0.2), 0 0 120px rgba(124,58,237,0.1)',
};

export default function BookingModal({ phase, loadingText, progress, ticketType, error, onViewTicket, onClose }: Props) {
  const isVisible = phase !== 'idle';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={overlayStyle}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={cardStyle}
          >
            {/* Glow orbs */}
            <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15), transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent)', pointerEvents: 'none' }} />

            {/* LOADING / PAYMENT phase */}
            {(phase === 'loading' || phase === 'payment') && (
              <LoadingContent phase={phase} loadingText={loadingText} progress={progress} ticketType={ticketType} />
            )}

            {/* SUCCESS phase */}
            {phase === 'success' && (
              <>
                <Confetti />
                <SuccessContent onViewTicket={onViewTicket} />
              </>
            )}

            {/* ERROR phase */}
            {phase === 'error' && (
              <ErrorContent error={error} onClose={onClose} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoadingContent({ phase, loadingText, progress, ticketType }: { phase: BookingPhase; loadingText: string; progress: number; ticketType: string }) {
  return (
    <>
      {/* Spinner */}
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 28px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#4F46E5',
            borderRightColor: '#7C3AED',
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 8,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#06B6D4',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
        }}>
          {phase === 'payment' ? '💳' : '🎫'}
        </div>
      </div>

      <motion.h2
        key={phase}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}
      >
        {phase === 'payment' ? 'Payment Gateway Opening...' : 'Booking your ticket...'}
      </motion.h2>

      <AnimatePresence mode="wait">
        <motion.p
          key={loadingText}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: 14, color: '#a0a0b8', marginBottom: 28 }}
        >
          {loadingText}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 6, overflow: 'hidden', marginBottom: 12 }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #06B6D4)',
            borderRadius: 100,
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: '#a0a0b8' }}>{progress}%</div>

      {phase === 'payment' && (
        <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(79,70,229,0.08)', borderRadius: 12, border: '1px solid rgba(79,70,229,0.15)' }}>
          <div style={{ fontSize: 12, color: '#818cf8' }}>🔒 Secure Demo Payment • {ticketType === 'premium' ? '$299' : '$599'}</div>
        </div>
      )}
    </>
  );
}

function SuccessContent({ onViewTicket }: { onViewTicket: () => void }) {
  return (
    <>
      {/* Animated checkmark */}
      <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 28px' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',
            border: '2px solid rgba(16,185,129,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(16,185,129,0.3)',
          }}
        >
          <motion.svg
            width="40" height="40" viewBox="0 0 40 40" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          >
            <motion.path
              d="M8 20 L17 29 L32 12"
              stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            />
          </motion.svg>
        </motion.div>
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: '1px solid rgba(16,185,129,0.3)',
          }}
        />
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 10, color: '#fff' }}
      >
        Payment Successful! 🎉
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ fontSize: 14, color: '#a0a0b8', marginBottom: 32, lineHeight: 1.6 }}
      >
        Your ticket has been booked successfully.<br />
        Payment Completed Successfully.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(79,70,229,0.5)' }}
        whileTap={{ scale: 0.97 }}
        onClick={onViewTicket}
        style={{
          width: '100%', padding: '14px 24px',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          border: 'none', borderRadius: 12,
          color: '#fff', fontSize: 15, fontWeight: 600,
          cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        View Ticket →
      </motion.button>
    </>
  );
}

function ErrorContent({ error, onClose }: { error: string; onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          border: '2px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 32,
        }}
      >
        ✕
      </motion.div>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 10, color: '#EF4444' }}>
        Booking Failed
      </h2>
      <p style={{ fontSize: 14, color: '#a0a0b8', marginBottom: 28 }}>{error}</p>
      <button
        onClick={onClose}
        style={{
          width: '100%', padding: '13px 24px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, color: '#fff', fontSize: 14,
          fontWeight: 600, cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </>
  );
}
