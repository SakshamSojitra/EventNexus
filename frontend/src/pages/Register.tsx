import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome to EventNexus.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, margin: '0 auto 16px', color: '#fff' }}>N</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create Account</h1>
          <p style={{ fontSize: 14, color: '#a0a0b8' }}>Join EventNexus as an attendee</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 40, border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label: 'Full Name', icon: FiUser, type: 'text', value: name, set: setName, placeholder: 'John Doe' },
            { label: 'Email', icon: FiMail, type: 'email', value: email, set: setEmail, placeholder: 'you@example.com' },
          ].map(({ label, icon: Icon, type, value, set, placeholder }) => (
            <div key={label} style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8, display: 'block' }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <Icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b8' }} />
                <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="input" style={{ paddingLeft: 40 }} required />
              </div>
            </div>
          ))}

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8, display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b8' }} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="input" style={{ paddingLeft: 40, paddingRight: 44 }} required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#a0a0b8', cursor: 'pointer' }}>
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(79,70,229,0.08)', borderRadius: 10, border: '1px solid rgba(79,70,229,0.2)', marginBottom: 24, fontSize: 13, color: '#a0a0b8' }}>
            🎟️ You'll be registered as an <span style={{ color: '#6366f1', fontWeight: 600 }}>Attendee</span> — browse and book amazing events.
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15 }}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#a0a0b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>
    </section>
  );
};

export default Register;
