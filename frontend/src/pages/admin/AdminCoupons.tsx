import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiPercent } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const inputS: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
  color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const emptyForm = () => ({ code: '', discountType: 'percentage', discountValue: 10, minAmount: 0, maxUses: 100, expiresAt: '', isActive: true });

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]  = useState<any>(null);
  const [form, setForm]        = useState(emptyForm());

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/coupons'); setCoupons(data); }
    catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openNew  = () => { setEditing(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      code: c.code,
      discountType:  c.discountType ?? c.type ?? 'percentage',
      discountValue: c.discountValue ?? c.value ?? 10,
      minAmount:     c.minAmount ?? 0,
      maxUses:       c.maxUses ?? c.usageLimit ?? 100,
      expiresAt:     c.expiresAt ? c.expiresAt.split('T')[0] : '',
      isActive:      c.isActive !== false,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.code.trim()) { toast.error('Coupon code is required'); return; }
    try {
      if (editing) { await API.put(`/admin/coupons/${editing._id}`, form); toast.success('Updated'); }
      else { await API.post('/admin/coupons', form); toast.success('Created'); }
      setShowForm(false); fetch();
    } catch { toast.error('Failed to save'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try { await API.delete(`/admin/coupons/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: '#a0a0b8' }}>{coupons.length} coupons</p>
        <button onClick={openNew} className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiPlus size={14} /> New Coupon
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {Array(4).fill(0).map((_,i) => <div key={i} style={{ height: 120, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : coupons.length === 0 ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎫</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No coupons yet</div>
          <div style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 20 }}>Create discount coupons for your events</div>
          <button onClick={openNew} className="btn btn-primary" style={{ padding: '10px 20px' }}><FiPlus size={14} /> Create Coupon</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {coupons.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: `1px solid ${c.isActive !== false ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.06)'}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(79,70,229,0.08)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(79,70,229,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiPercent size={16} color="#818cf8" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 1 }}>{c.code}</div>
                    <div style={{ fontSize: 11, color: '#a0a0b8', textTransform: 'capitalize' }}>{c.discountType}</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: c.isActive !== false ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: c.isActive !== false ? '#10B981' : '#EF4444' }}>
                  {c.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#818cf8', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                {(c.discountType ?? c.type) === 'percentage' ? `${c.discountValue ?? c.value}% OFF` : `₹${c.discountValue ?? c.value} OFF`}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#a0a0b8', marginBottom: 14 }}>
                {(c.maxUses ?? c.usageLimit) && <span>Max: {c.usedCount ?? 0}/{c.maxUses ?? c.usageLimit}</span>}
                {c.expiresAt && <span>Expires: {new Date(c.expiresAt).toLocaleDateString()}</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(c)} style={{ flex: 1, padding: '7px', background: 'rgba(79,70,229,0.15)', border: 'none', borderRadius: 8, color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12 }}><FiEdit2 size={12} /> Edit</button>
                <button onClick={() => del(c._id)} style={{ padding: '7px 10px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 8, color: '#EF4444', cursor: 'pointer' }}><FiTrash2 size={13} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#0d0d1f', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: 28, width: '100%', maxWidth: 460 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{editing ? 'Edit Coupon' : 'New Coupon'}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#a0a0b8', cursor: 'pointer' }}><FiX size={18} /></button>
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Coupon Code *</label>
                  <input value={form.code} onChange={e => setForm(p => ({...p, code: e.target.value.toUpperCase()}))} style={inputS} placeholder="e.g. SAVE20" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Discount Type</label>
                    <select value={form.discountType} onChange={e => setForm(p => ({...p, discountType: e.target.value}))} style={inputS}>
                      <option value="percentage" style={{ background: '#0d0d1f' }}>Percentage (%)</option>
                      <option value="fixed" style={{ background: '#0d0d1f' }}>Fixed (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Value</label>
                    <input type="number" value={form.discountValue} onChange={e => setForm(p => ({...p, discountValue: Number(e.target.value)}))} style={inputS} min={0} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Max Uses</label>
                    <input type="number" value={form.maxUses} onChange={e => setForm(p => ({...p, maxUses: Number(e.target.value)}))} style={inputS} min={1} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Expires At</label>
                    <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({...p, expiresAt: e.target.value}))} style={inputS} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="active" checked={form.isActive} onChange={e => setForm(p => ({...p, isActive: e.target.checked}))} style={{ cursor: 'pointer' }} />
                  <label htmlFor="active" style={{ fontSize: 13, cursor: 'pointer', color: '#a0a0b8' }}>Active</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: '#a0a0b8', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button onClick={save} className="btn btn-primary" style={{ flex: 1, padding: '10px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <FiCheck size={13} /> {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
