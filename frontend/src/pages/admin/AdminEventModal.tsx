import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const CATEGORIES = ['technology','ai','startups','gaming','music','sports','business','design','marketing','finance'];
const TICKET_TYPES = ['free','general','vip','student','early_bird'];

interface ModalProps {
  event?: any;
  onClose: () => void;
  onSaved: () => void;
}

const emptyForm = () => ({
  title: '', description: '', category: 'technology', banner: '',
  status: 'published', featured: false, capacity: 100,
  venue: { name: '', city: '', country: '', address: '' },
  dateTime: { startDate: '', endDate: '', startTime: '09:00 AM', endTime: '06:00 PM' },
  tickets: [{ type: 'free', name: 'General Admission', price: 0, quantity: 100, description: '', benefits: [''] }],
  speakers: [{ name: '', title: '', company: '', bio: '' }],
  schedule: [{ title: '', description: '', startTime: '', endTime: '', speaker: '' }],
});

export default function AdminEventModal({ event, onClose, onSaved }: ModalProps) {
  const [tab, setTab] = useState<'basic' | 'tickets' | 'speakers' | 'schedule'>('basic');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        category: event.category || 'technology',
        banner: event.banner || '',
        status: event.status || 'published',
        featured: event.featured || false,
        capacity: event.capacity || 100,
        venue: event.venue || { name: '', city: '', country: '', address: '' },
        dateTime: {
          startDate: event.dateTime?.startDate ? event.dateTime.startDate.split('T')[0] : '',
          endDate: event.dateTime?.endDate ? event.dateTime.endDate.split('T')[0] : '',
          startTime: event.dateTime?.startTime || '09:00 AM',
          endTime: event.dateTime?.endTime || '06:00 PM',
        },
        tickets: event.tickets?.length ? event.tickets : emptyForm().tickets,
        speakers: event.speakers?.length ? event.speakers : emptyForm().speakers,
        schedule: event.schedule?.length ? event.schedule : emptyForm().schedule,
      });
    } else {
      setForm(emptyForm());
    }
  }, [event]);

  const set = (path: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev } as any;
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (event?._id) {
        await API.put(`/admin/events/${event._id}`, form);
        toast.success('Event updated');
      } else {
        await API.post('/admin/events', form);
        toast.success('Event created');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff',
    fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, color: '#a0a0b8', marginBottom: 6, display: 'block' };

  const TABS = ['basic', 'tickets', 'speakers', 'schedule'] as const;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', background: '#0d0d1f', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>
              {event ? 'Edit Event' : 'Create Event'}
            </h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0b8', cursor: 'pointer' }}>
              <FiX size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, textTransform: 'capitalize',
                  background: tab === t ? 'rgba(79,70,229,0.25)' : 'transparent',
                  color: tab === t ? '#818cf8' : '#a0a0b8' }}>
                {t}
              </button>
            ))}
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

            {/* BASIC TAB */}
            {tab === 'basic' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input value={form.title} onChange={(e) => set('title', e.target.value)} style={inputStyle} required placeholder="Event title" />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={form.description} onChange={(e) => set('description', e.target.value)} style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} placeholder="Event description" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select value={form.category} onChange={(e) => set('category', e.target.value)} style={inputStyle}>
                      {CATEGORIES.map((c) => <option key={c} value={c} style={{ background: '#0d0d1f' }}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inputStyle}>
                      {['published','draft','cancelled','completed','archived'].map((s) => <option key={s} value={s} style={{ background: '#0d0d1f' }}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input type="date" value={form.dateTime.startDate} onChange={(e) => set('dateTime.startDate', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input type="date" value={form.dateTime.endDate} onChange={(e) => set('dateTime.endDate', e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Capacity</label>
                    <input type="number" value={form.capacity} onChange={(e) => set('capacity', Number(e.target.value))} style={inputStyle} min={1} />
                  </div>
                  <div>
                    <label style={labelStyle}>Venue City</label>
                    <input value={form.venue.city} onChange={(e) => set('venue.city', e.target.value)} style={inputStyle} placeholder="City" />
                  </div>
                  <div>
                    <label style={labelStyle}>Country</label>
                    <input value={form.venue.country} onChange={(e) => set('venue.country', e.target.value)} style={inputStyle} placeholder="Country" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Banner URL</label>
                  <input value={form.banner} onChange={(e) => set('banner', e.target.value)} style={inputStyle} placeholder="https://..." />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} style={{ cursor: 'pointer' }} />
                  <label htmlFor="featured" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Featured event</label>
                </div>
              </div>
            )}

            {/* TICKETS TAB */}
            {tab === 'tickets' && (
              <div style={{ display: 'grid', gap: 16 }}>
                {form.tickets.map((ticket, i) => (
                  <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Ticket {i + 1}</span>
                      {form.tickets.length > 1 && (
                        <button type="button" onClick={() => setForm((p) => ({ ...p, tickets: p.tickets.filter((_, j) => j !== i) }))}
                          style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <FiTrash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={labelStyle}>Type</label>
                        <select value={ticket.type} onChange={(e) => setForm((p) => { const t = [...p.tickets]; t[i] = { ...t[i], type: e.target.value }; return { ...p, tickets: t }; })} style={inputStyle}>
                          {TICKET_TYPES.map((t) => <option key={t} value={t} style={{ background: '#0d0d1f' }}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Name</label>
                        <input value={ticket.name} onChange={(e) => setForm((p) => { const t = [...p.tickets]; t[i] = { ...t[i], name: e.target.value }; return { ...p, tickets: t }; })} style={inputStyle} placeholder="Ticket name" />
                      </div>
                      <div>
                        <label style={labelStyle}>Price ($)</label>
                        <input type="number" value={ticket.price} onChange={(e) => setForm((p) => { const t = [...p.tickets]; t[i] = { ...t[i], price: Number(e.target.value) }; return { ...p, tickets: t }; })} style={inputStyle} min={0} />
                      </div>
                      <div>
                        <label style={labelStyle}>Quantity</label>
                        <input type="number" value={ticket.quantity} onChange={(e) => setForm((p) => { const t = [...p.tickets]; t[i] = { ...t[i], quantity: Number(e.target.value) }; return { ...p, tickets: t }; })} style={inputStyle} min={1} />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setForm((p) => ({ ...p, tickets: [...p.tickets, { type: 'general', name: '', price: 0, quantity: 50, description: '', benefits: [''] }] }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(79,70,229,0.15)', border: '1px dashed rgba(79,70,229,0.4)', borderRadius: 10, color: '#818cf8', cursor: 'pointer', fontSize: 13 }}>
                  <FiPlus size={14} /> Add Ticket Type
                </button>
              </div>
            )}

            {/* SPEAKERS TAB */}
            {tab === 'speakers' && (
              <div style={{ display: 'grid', gap: 16 }}>
                {form.speakers.map((speaker, i) => (
                  <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Speaker {i + 1}</span>
                      {form.speakers.length > 1 && (
                        <button type="button" onClick={() => setForm((p) => ({ ...p, speakers: p.speakers.filter((_, j) => j !== i) }))}
                          style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <FiTrash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={labelStyle}>Name</label>
                        <input value={speaker.name} onChange={(e) => setForm((p) => { const s = [...p.speakers]; s[i] = { ...s[i], name: e.target.value }; return { ...p, speakers: s }; })} style={inputStyle} placeholder="Speaker name" />
                      </div>
                      <div>
                        <label style={labelStyle}>Title</label>
                        <input value={speaker.title} onChange={(e) => setForm((p) => { const s = [...p.speakers]; s[i] = { ...s[i], title: e.target.value }; return { ...p, speakers: s }; })} style={inputStyle} placeholder="Job title" />
                      </div>
                      <div>
                        <label style={labelStyle}>Company</label>
                        <input value={speaker.company} onChange={(e) => setForm((p) => { const s = [...p.speakers]; s[i] = { ...s[i], company: e.target.value }; return { ...p, speakers: s }; })} style={inputStyle} placeholder="Company" />
                      </div>
                      <div>
                        <label style={labelStyle}>Bio</label>
                        <input value={speaker.bio} onChange={(e) => setForm((p) => { const s = [...p.speakers]; s[i] = { ...s[i], bio: e.target.value }; return { ...p, speakers: s }; })} style={inputStyle} placeholder="Short bio" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setForm((p) => ({ ...p, speakers: [...p.speakers, { name: '', title: '', company: '', bio: '' }] }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(79,70,229,0.15)', border: '1px dashed rgba(79,70,229,0.4)', borderRadius: 10, color: '#818cf8', cursor: 'pointer', fontSize: 13 }}>
                  <FiPlus size={14} /> Add Speaker
                </button>
              </div>
            )}

            {/* SCHEDULE TAB */}
            {tab === 'schedule' && (
              <div style={{ display: 'grid', gap: 16 }}>
                {form.schedule.map((item, i) => (
                  <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Session {i + 1}</span>
                      {form.schedule.length > 1 && (
                        <button type="button" onClick={() => setForm((p) => ({ ...p, schedule: p.schedule.filter((_, j) => j !== i) }))}
                          style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <FiTrash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Session Title</label>
                        <input value={item.title} onChange={(e) => setForm((p) => { const s = [...p.schedule]; s[i] = { ...s[i], title: e.target.value }; return { ...p, schedule: s }; })} style={inputStyle} placeholder="Session title" />
                      </div>
                      <div>
                        <label style={labelStyle}>Start Time</label>
                        <input value={item.startTime} onChange={(e) => setForm((p) => { const s = [...p.schedule]; s[i] = { ...s[i], startTime: e.target.value }; return { ...p, schedule: s }; })} style={inputStyle} placeholder="09:00 AM" />
                      </div>
                      <div>
                        <label style={labelStyle}>End Time</label>
                        <input value={item.endTime} onChange={(e) => setForm((p) => { const s = [...p.schedule]; s[i] = { ...s[i], endTime: e.target.value }; return { ...p, schedule: s }; })} style={inputStyle} placeholder="10:00 AM" />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Description</label>
                        <input value={item.description} onChange={(e) => setForm((p) => { const s = [...p.schedule]; s[i] = { ...s[i], description: e.target.value }; return { ...p, schedule: s }; })} style={inputStyle} placeholder="Session description" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setForm((p) => ({ ...p, schedule: [...p.schedule, { title: '', description: '', startTime: '', endTime: '', speaker: '' }] }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(79,70,229,0.15)', border: '1px dashed rgba(79,70,229,0.4)', borderRadius: 10, color: '#818cf8', cursor: 'pointer', fontSize: 13 }}>
                  <FiPlus size={14} /> Add Session
                </button>
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: '#a0a0b8', cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
                {saving ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
