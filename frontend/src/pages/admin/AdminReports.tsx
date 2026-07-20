import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiUsers, FiCalendar, FiDollarSign, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../utils/api';

interface ReportCard {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  endpoint: string;
}

const REPORTS: ReportCard[] = [
  { id: 'bookings',  icon: FiBookOpen,   title: 'Bookings Report',  description: 'All booking transactions with user and event details',  color: '#06B6D4', endpoint: '/admin/bookings?limit=1000' },
  { id: 'users',     icon: FiUsers,      title: 'Users Report',     description: 'Registered attendees with account status',              color: '#4F46E5', endpoint: '/admin/users?limit=1000' },
  { id: 'events',    icon: FiCalendar,   title: 'Events Report',    description: 'All events with capacity, status and organizer info',   color: '#7C3AED', endpoint: '/admin/events?limit=1000' },
  { id: 'revenue',   icon: FiDollarSign, title: 'Revenue Report',   description: 'Revenue breakdown by event, month and ticket type',    color: '#10B981', endpoint: '/admin/revenue' },
  { id: 'audit',     icon: FiFileText,   title: 'Audit Log',        description: 'Admin actions log with timestamps and IP addresses',   color: '#F59E0B', endpoint: '/admin/audit-logs?limit=500' },
];

function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const download = async (r: ReportCard) => {
    setLoading(p => ({ ...p, [r.id]: true }));
    try {
      const { data } = await API.get(r.endpoint);
      downloadJSON(data, `eventnexus-${r.id}-${new Date().toISOString().split('T')[0]}.json`);
      toast.success(`${r.title} downloaded`);
    } catch { toast.error('Failed to generate report'); }
    finally { setLoading(p => ({ ...p, [r.id]: false })); }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <p style={{ fontSize: 14, color: '#a0a0b8', marginBottom: 28 }}>Download data exports in JSON format for analysis</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {REPORTS.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -16, right: -16, width: 70, height: 70, borderRadius: '50%', background: `${r.color}12` }} />
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${r.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <r.icon size={20} style={{ color: r.color }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: '#a0a0b8', lineHeight: 1.5, marginBottom: 18 }}>{r.description}</div>
            <button
              onClick={() => download(r)}
              disabled={loading[r.id]}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
                background: `${r.color}18`, border: `1px solid ${r.color}40`,
                borderRadius: 9, color: r.color, cursor: loading[r.id] ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600, opacity: loading[r.id] ? 0.7 : 1, width: '100%',
                justifyContent: 'center',
              }}
            >
              <FiDownload size={13} /> {loading[r.id] ? 'Generating...' : 'Download JSON'}
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ marginTop: 28, padding: 20, background: 'rgba(79,70,229,0.06)', borderRadius: 14, border: '1px solid rgba(79,70,229,0.15)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: 6 }}>ℹ️ About Reports</div>
        <div style={{ fontSize: 12, color: '#a0a0b8', lineHeight: 1.6 }}>
          All reports are exported as JSON and include live data from the database. For CSV/Excel exports or scheduled reports, connect a third-party analytics tool using the admin API endpoints.
        </div>
      </motion.div>
    </div>
  );
}
