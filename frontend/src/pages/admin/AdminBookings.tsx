import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiDownload, FiEye, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  confirmed: { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  pending:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  cancelled: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  refunded:  { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
};

const inputS: React.CSSProperties = {
  padding: '9px 14px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9,
  color: '#fff', fontSize: 13, outline: 'none',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await API.get('/admin/bookings', { params });
      setBookings(data.bookings || []); setTotal(data.total || 0);
    } catch {
      if (bookings.length === 0) {
        toast.error('Failed to load bookings');
      }
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, status]);
  useEffect(() => { const t = setTimeout(fetch, 400); return () => clearTimeout(t); }, [search]);

  const updateStatus = async (id: string, s: string) => {
    try { await API.put(`/admin/bookings/${id}/status`, { status: s }); toast.success('Updated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const pages = Math.ceil(total / 15);

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: '#a0a0b8' }}>{total} total bookings</p>
        <button onClick={fetch} style={{ ...inputS, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#606080' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or ticket #..." style={{ ...inputS, width: '100%', paddingLeft: 34 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiFilter size={13} style={{ color: '#606080' }} />
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputS, width: 150 }}>
            <option value="">All Status</option>
            {['confirmed','pending','cancelled','refunded'].map(s => (
              <option key={s} value={s} style={{ background: '#0d0d1f' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Booking ID','User','Event','Ticket','Price','Status','Date','Actions'].map(h => (
                <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: 11, color: '#606080', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(8).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={8} style={{ padding: 14 }}><div style={{ height: 18, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} /></td></tr>
            )) : bookings.length === 0 ? (
              <tr><td colSpan={8}>
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No bookings found</div>
                  <div style={{ fontSize: 13, color: '#a0a0b8' }}>Try adjusting your search or filters</div>
                </div>
              </td></tr>
            ) : bookings.map((b) => {
              const cfg = STATUS_CFG[b.bookingStatus] ?? STATUS_CFG.pending;
              return (
                <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#818cf8', fontFamily: 'monospace' }}>{b.bookingId?.slice(0,10) ?? b._id?.slice(0,10)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {b.user?.name?.[0] ?? '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{b.user?.name ?? '—'}</div>
                        <div style={{ fontSize: 11, color: '#a0a0b8' }}>{b.user?.email ?? '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.event?.title ?? '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#a0a0b8', textTransform: 'capitalize' }}>{b.ticketType ?? '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#10B981' }}>{b.price === 0 ? 'FREE' : `₹${b.price}`}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <select value={b.bookingStatus} onChange={e => updateStatus(b._id, e.target.value)}
                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.color}40`, color: cfg.color, cursor: 'pointer' }}>
                      {['confirmed','pending','cancelled','refunded'].map(s => (
                        <option key={s} value={s} style={{ background: '#0d0d1f', color: '#fff' }}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#a0a0b8' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button style={{ padding: '5px 8px', background: 'rgba(79,70,229,0.15)', border: 'none', borderRadius: 6, color: '#818cf8', cursor: 'pointer' }}><FiEye size={13} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
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
