import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent, selectedRole?: string) => {
    e.preventDefault();
    try {
      await register(name, email, password, selectedRole || role);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, margin: '0 auto 16px',
          }}>N</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            {step === 1 ? 'Create Account' : 'Choose Your Role'}
          </h1>
          <p style={{ fontSize: 14, color: '#a0a0b8' }}>Join Event Nexus AI today</p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          {[1, 2].map((s) => (
            <div key={s} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: s <= step ? '#4F46E5' : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 20, padding: 40,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8, display: 'block' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b8' }} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" className="input" style={{ paddingLeft: 40 }} required />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8, display: 'block' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <FiMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b8' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input" style={{ paddingLeft: 40 }} required />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8, display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b8' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" className="input" style={{ paddingLeft: 40, paddingRight: 40 }} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#a0a0b8', cursor: 'pointer' }}>
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15 }}>
              Continue <FiChevronRight />
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { value: 'user', label: 'Attendee', desc: 'Discover and attend amazing events' },
              { value: 'organizer', label: 'Organizer', desc: 'Create and manage events' },
            ].map((r) => (
              <motion.button
                key={r.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => { setRole(r.value); handleSubmit(new Event('submit') as any, r.value); }}
                style={{
                  padding: 24, background: role === r.value ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.03)',
                  borderRadius: 16, border: role === r.value ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{r.label}</div>
                <div style={{ fontSize: 13, color: '#a0a0b8' }}>{r.desc}</div>
              </motion.button>
            ))}
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#a0a0b8', cursor: 'pointer', fontSize: 13, marginTop: 8 }}>
              ← Back
            </button>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: '#a0a0b8' }}>Already have an account? </span>
          <Link to="/login" style={{ fontSize: 13, color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </div>
      </motion.div>
    </section>
  );
};

export default Register;