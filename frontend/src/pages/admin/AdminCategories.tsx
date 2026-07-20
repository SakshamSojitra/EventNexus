import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const inputS: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
  color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const ICONS = ['🎵','🎮','💼','🤖','🏃','🎨','💡','📱','🌍','🎓','💰','📊'];

export default function AdminCategories() {
  const [cats, setCats]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<any>(null);
  const [form, setForm]           = useState({ name: '', icon: '🎵', color: '#4F46E5', description: '' });

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/categories'); setCats(data); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openNew  = () => { setEditing(null); setForm({ name: '', icon: '🎵', color: '#4F46E5', description: '' }); setShowForm(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name, icon: c.icon ?? '🎵', color: c.color ?? '#4F46E5', description: c.description ?? '' }); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      if (editing) { await API.put(`/admin/categories/${editing._id}`, form); toast.success('Updated'); }
      else { await API.post('/admin/categories', form); toast.success('Created'); }
      setShowForm(false); fetch();
    } catch { toast.error('Failed to save'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await API.delete(`/admin/categories/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: '#a0a0b8' }}>{cats.length} categories configured</p>
        <button onClick={openNew} className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiPlus size={14} /> Add Category
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {Array(6).fill(0).map((_, i) => <div key={i} style={{ height: 100, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : cats.length === 0 ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No categories yet</div>
          <div style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 20 }}>Create your first event category to get started</div>
          <button onClick={openNew} className="btn btn-primary" style={{ padding: '10px 20px' }}><FiPlus size={14} /> Add Category</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {cats.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color ?? '#4F46E5'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {c.icon ?? '🏷️'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{c.name}</div>
                  {c.description && <div style={{ fontSize: 11, color: '#a0a0b8', marginTop: 2 }}>{c.description}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button onClick={() => openEdit(c)} style={{ padding: '5px 8px', background: 'rgba(79,70,229,0.15)', border: 'none', borderRadius: 6, color: '#818cf8', cursor: 'pointer' }}><FiEdit2 size={12} /></button>
                <button onClick={() => del(c._id)} style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, color: '#EF4444', cursor: 'pointer' }}><FiTrash2 size={12} /></button>
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
              style={{ background: '#0d0d1f', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: 28, width: '100%', maxWidth: 440 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{editing ? 'Edit Category' : 'New Category'}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#a0a0b8', cursor: 'pointer' }}><FiX size={18} /></button>
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputS} placeholder="e.g. Technology" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Description</label>
                  <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={inputS} placeholder="Short description" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 8, display: 'block' }}>Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {ICONS.map(ic => (
                      <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))}
                        style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${form.icon === ic ? '#4F46E5' : 'rgba(255,255,255,0.1)'}`, background: form.icon === ic ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.04)', fontSize: 18, cursor: 'pointer' }}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: 40, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer' }} />
                    <span style={{ fontSize: 13, color: '#a0a0b8' }}>{form.color}</span>
                  </div>
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
