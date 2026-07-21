import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';
import AdminEventModal from './AdminEventModal';

const STATUS_COLORS: Record<string, string> = {
  published: '#10B981', draft: '#F59E0B', cancelled: '#EF4444', completed: '#06B6D4', archived: '#a0a0b8',
};

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await API.get('/admin/events', { params });
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch {
      // Only show toast if we haven't already loaded data
      if (events.length === 0) {
        toast.error('Failed to load events');
      }
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [page, statusFilter]);
  useEffect(() => { const t = setTimeout(fetchEvents, 400); return () => clearTimeout(t); }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try { await API.delete(`/admin/events/${id}`); toast.success('Deleted'); fetchEvents(); }
    catch { toast.error('Failed'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try { await API.put(`/admin/events/${id}`, { status }); toast.success(`Status: ${status}`); fetchEvents(); }
    catch { toast.error('Failed'); }
  };

  const handleBulkStatus = async (status: string) => {
    if (!selected.length) return;
    try { await API.put('/admin/events/bulk/status', { ids: selected, status }); toast.success('Updated'); setSelected([]); fetchEvents(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ maxWidth: 1400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700 }}>Events</h1>
            <p style={{ fontSize: 13, color: '#a0a0b8', marginTop: 4 }}>{total} total events</p>
          </div>
          <button onClick={() => { setEditEvent(null); setShowModal(true); }} className="btn btn-primary" style={{ gap: 8, padding: '10px 18px', fontSize: 13 }}>
            <FiPlus size={15} /> Create Event
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b8' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="input" style={{ paddingLeft: 36, fontSize: 13 }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input" style={{ width: 140, fontSize: 13 }}>
            <option value="">All Status</option>
            {['published', 'draft', 'cancelled', 'completed', 'archived'].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          {selected.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleBulkStatus('published')} className="btn btn-accent" style={{ fontSize: 12, padding: '8px 14px' }}><FiCheck size={13} /> Publish ({selected.length})</button>
              <button onClick={() => handleBulkStatus('cancelled')} style={{ fontSize: 12, padding: '8px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', cursor: 'pointer' }}><FiX size={13} /> Cancel ({selected.length})</button>
            </div>
          )}
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, color: '#a0a0b8', fontWeight: 500 }}>
                  <input type="checkbox" onChange={(e) => setSelected(e.target.checked ? events.map(ev => ev._id) : [])} style={{ cursor: 'pointer' }} />
                </th>
                {['Event', 'Category', 'Date', 'Capacity', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, color: '#a0a0b8', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={7} style={{ padding: 16 }}><div style={{ height: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} /></td></tr>
                ))
              ) : events.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#a0a0b8', fontSize: 14 }}>No events found</td></tr>
              ) : events.map((ev) => (
                <tr key={ev._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px' }}>
                    <input type="checkbox" checked={selected.includes(ev._id)} onChange={(e) => setSelected(e.target.checked ? [...selected, ev._id] : selected.filter((id) => id !== ev._id))} style={{ cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {ev.banner ? <img src={ev.banner} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(79,70,229,0.2)' }} />}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: '#a0a0b8' }}>{ev.venue?.city}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#a0a0b8', textTransform: 'capitalize' }}>{ev.category}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#a0a0b8' }}>
                    {ev.dateTime?.startDate ? new Date(ev.dateTime.startDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#a0a0b8' }}>{ev.ticketsSold || 0} / {ev.capacity}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <select value={ev.status} onChange={(e) => handleStatusChange(ev._id, e.target.value)}
                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: `${STATUS_COLORS[ev.status] || '#a0a0b8'}20`, border: `1px solid ${STATUS_COLORS[ev.status] || '#a0a0b8'}40`, color: STATUS_COLORS[ev.status] || '#a0a0b8', cursor: 'pointer' }}>
                      {['published', 'draft', 'cancelled', 'completed', 'archived'].map((s) => (
                        <option key={s} value={s} style={{ background: '#0a0a1a', color: '#fff' }}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setEditEvent(ev); setShowModal(true); }} style={{ padding: '6px', background: 'rgba(79,70,229,0.15)', border: 'none', borderRadius: 6, color: '#6366f1', cursor: 'pointer' }}><FiEdit2 size={13} /></button>
                      <button onClick={() => handleDelete(ev._id)} style={{ padding: '6px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer' }}><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Pagination */}
        {total > 15 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            {Array(Math.ceil(total / 15)).fill(0).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: page === i + 1 ? '#4F46E5' : 'rgba(255,255,255,0.06)', color: page === i + 1 ? '#fff' : '#a0a0b8' }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {showModal && <AdminEventModal event={editEvent} onClose={() => setShowModal(false)} onSaved={fetchEvents} />}
      </div>
  );
}
