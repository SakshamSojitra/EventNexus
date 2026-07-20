import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiEyeOff, FiEye, FiTrash2, FiBookmark } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <FiStar key={s} size={12} style={{ color: s <= rating ? '#F59E0B' : '#303050', fill: s <= rating ? '#F59E0B' : 'none' }} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/admin/reviews'); setReviews(data); }
    catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const action = async (eventId: string, reviewId: string, act: string) => {
    try { await API.put(`/admin/reviews/${eventId}/${reviewId}`, { action: act }); toast.success('Updated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      <p style={{ fontSize: 14, color: '#a0a0b8', marginBottom: 24 }}>{reviews.length} reviews across all events</p>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array(5).fill(0).map((_,i) => <div key={i} style={{ height: 90, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No reviews yet</div>
          <div style={{ fontSize: 13, color: '#a0a0b8' }}>Reviews will appear here after attendees rate events</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map((r, i) => (
            <motion.div key={`${r.eventId}-${r._id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              style={{
                padding: '16px 20px', borderRadius: 14,
                background: r.isHidden ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${r.isHidden ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
                opacity: r.isHidden ? 0.7 : 1,
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {r.user?.name?.[0] ?? '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.user?.name ?? 'Anonymous'}</div>
                      <div style={{ fontSize: 11, color: '#a0a0b8' }}>on <span style={{ color: '#818cf8' }}>{r.eventTitle}</span></div>
                    </div>
                    <Stars rating={r.rating ?? 0} />
                    {r.isPinned && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>Pinned</span>}
                    {r.isHidden && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>Hidden</span>}
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: '#c0c0d8', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>}
                  <div style={{ fontSize: 11, color: '#606080', marginTop: 6 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  <button onClick={() => action(r.eventId, r._id, r.isPinned ? 'unpin' : 'pin')} title={r.isPinned ? 'Unpin' : 'Pin'}
                    style={{ padding: '5px 7px', background: 'rgba(245,158,11,0.15)', border: 'none', borderRadius: 6, color: '#F59E0B', cursor: 'pointer' }}><FiBookmark size={12} /></button>
                  <button onClick={() => action(r.eventId, r._id, r.isHidden ? 'show' : 'hide')} title={r.isHidden ? 'Show' : 'Hide'}
                    style={{ padding: '5px 7px', background: 'rgba(79,70,229,0.15)', border: 'none', borderRadius: 6, color: '#818cf8', cursor: 'pointer' }}>
                    {r.isHidden ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                  </button>
                  <button onClick={() => action(r.eventId, r._id, 'delete')} title="Delete"
                    style={{ padding: '5px 7px', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, color: '#EF4444', cursor: 'pointer' }}><FiTrash2 size={12} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
