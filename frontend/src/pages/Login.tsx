import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminError, setIsAdminError] = useState(false);
  const { login, isLoading } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminError(false);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg: string = err.message || '';
      if (msg.toLowerCase().includes('admin')) {
        setIsAdminError(true); // show inline banner, suppress toast
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, margin: '0 auto 16px', color: '#fff' }}>N</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome Back</h1>
          <p style={{ fontSize: 14, color: '#a0a0b8' }}>Sign in to your EventNexus account</p>
        </div>

        {/* Admin redirect banner */}
        <AnimatePresence>
          {isAdminError && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                marginBottom: 16, padding: '16px 20px',
                background: 'rgba(79,70,229,0.12)',
                border: '1px solid rgba(79,70,229,0.4)',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <FiShield size={15} color="#818cf8" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#c0bfff' }}>Admin account detected</span>
              </div>
              <p style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 12, lineHeight: 1.5 }}>
                Admin accounts must sign in through the dedicated Admin Portal.
              </p>
              <Link
                to="/admin/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  borderRadius: 9, textDecoration: 'none',
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                }}
              >
                <FiShield size={13} /> Go to Admin Portal →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 40, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8, display: 'block' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b8' }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" style={{ paddingLeft: 40 }} required />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8, display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b8' }} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input" style={{ paddingLeft: 40, paddingRight: 44 }} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#a0a0b8', cursor: 'pointer' }}>
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15 }}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#a0a0b8' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
          </div>

          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <Link to="/admin/login" style={{ fontSize: 12, color: '#504870', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <FiShield size={11} /> Admin? Use the Admin Portal
            </Link>
          </div>
        </form>
      </motion.div>
    </section>
  );
};

export default Login;
