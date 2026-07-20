import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiUserX, FiUserCheck, FiTrash2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const inputS: React.CSSProperties = {
  padding: '9px 14px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9,
  color: '#fff', fontSize: 13, outline: 'none',
};

export default function AdminUsers() {
  const [users, setUsers]     = useState<any[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await API.get('/admin/users', { params });
      setUsers(data.users); setTotal(data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, status]);
  useEffect(() => { const t = setTimeout(fetch, 400); return () => clearTimeout(t); }, [search]);

  const action = async (id: string, act: string) => {
    try { await API.put(`/admin/users/${id}/status`, { action: act }); toast.success(`User ${act}d`); fetch(); }
    catch { toast.error('Failed'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try { await API.delete(`/admin/users/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const pages = Math.ceil(total / 15);

  return (
    <div style={{ maxWidth: 1400 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: '#a0a0b8' }}>{total} registered attendees</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#606080' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ ...inputS, width: '100%', paddingLeft: 34 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiFilter size={13} style={{ color: '#606080' }} />
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputS, width: 140 }}>
            <option value="">All Users</option>
            <option value="active" style={{ background: '#0d0d1f' }}>Active</option>
            <option value="suspended" style={{ background: '#0d0d1f' }}>Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['User','Email','Role','Status','Joined','Actions'].map(h => (
                <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: 11, color: '#606080', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(8).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={6} style={{ padding: 14 }}><div style={{ height: 18, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} /></td></tr>
            )) : users.length === 0 ? (
              <tr><td colSpan={6}>
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No users found</div>
                  <div style={{ fontSize: 13, color: '#a0a0b8' }}>Users will appear here once they register</div>
                </div>
              </td></tr>
            ) : users.map(u => {
              const isSuspended = u.isSuspended;
              const isActive = u.isActive !== false;
              return (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {u.name?.[0] ?? '?'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#a0a0b8' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(79,70,229,0.15)', color: '#818cf8', textTransform: 'capitalize' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20,
                      background: isSuspended ? 'rgba(239,68,68,0.12)' : isActive ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                      color: isSuspended ? '#EF4444' : isActive ? '#10B981' : '#F59E0B' }}>
                      {isSuspended ? 'Suspended' : isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#a0a0b8' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {isSuspended
                        ? <button onClick={() => action(u._id, 'unsuspend')} title="Unsuspend" style={{ padding: '5px 7px', background: 'rgba(16,185,129,0.15)', border: 'none', borderRadius: 6, color: '#10B981', cursor: 'pointer' }}><FiUserCheck size={13} /></button>
                        : <button onClick={() => action(u._id, 'suspend')} title="Suspend" style={{ padding: '5px 7px', background: 'rgba(245,158,11,0.15)', border: 'none', borderRadius: 6, color: '#F59E0B', cursor: 'pointer' }}><FiUserX size={13} /></button>
                      }
                      <button onClick={() => del(u._id)} style={{ padding: '5px 7px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, color: '#EF4444', cursor: 'pointer' }}><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
          {Array(pages).fill(0).map((_, i) => (
            <button key={i} onClick={() => setPage(i+1)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: page===i+1 ? '#4F46E5' : 'rgba(255,255,255,0.06)', color: page===i+1 ? '#fff' : '#a0a0b8' }}>{i+1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
