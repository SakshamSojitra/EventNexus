import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin, isLoading } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLogin(email, password);
      toast.success('Admin access granted');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px', background: 'radial-gradient(ellipse at 50% 0%, rgba(79,70,229,0.12) 0%, transparent 60%)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(79,70,229,0.4)' }}
          >
            <FiShield size={28} color="#fff" />
          </motion.div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Admin Portal</h1>
          <p style={{ fontSize: 14, color: '#a0a0b8' }}>Restricted access — authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 40, border: '1px solid rgba(79,70,229,0.15)' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8, display: 'block' }}>Admin Email</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b8' }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@eventnexus.com" className="input" style={{ paddingLeft: 40 }} required />
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
            {isLoading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#606080' }}>
          This portal is for authorized administrators only. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </section>
  );
};

export default AdminLogin;
