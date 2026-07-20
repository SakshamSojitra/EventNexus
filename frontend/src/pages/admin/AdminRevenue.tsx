import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FiDollarSign, FiTrendingUp, FiCalendar, FiStar } from 'react-icons/fi';
import API from '../../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -16, right: -16, width: 70, height: 70, borderRadius: '50%', background: `${color}18` }} />
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>${Number(value).toLocaleString()}</div>
      <div style={{ fontSize: 13, color: '#a0a0b8', marginTop: 4 }}>{label}</div>
    </motion.div>
  );
}

export default function AdminRevenue() {
  const [data, setData]         = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([API.get('/admin/revenue'), API.get('/admin/analytics')])
      .then(([r, a]) => { setData(r.data); setAnalytics(a.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const monthly = (analytics?.revenueByMonth ?? []).map((r: any) => ({
    name: MONTHS[(r._id?.month ?? 1) - 1],
    revenue: r.revenue ?? 0,
    bookings: r.bookings ?? 0,
  }));

  const ticketBreakdown = (analytics?.ticketTypeBreakdown ?? []).map((t: any) => ({
    name: t._id ?? 'Unknown',
    revenue: t.revenue ?? 0,
    count: t.count ?? 0,
  }));

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16 }}>
      {Array(4).fill(0).map((_,i) => <div key={i} style={{ height: 110, borderRadius: 16, background: 'rgba(255,255,255,0.04)' }} />)}
    </div>
  );

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={FiDollarSign} label="Total Revenue"   value={data?.total ?? 0}   color="#10B981" />
        <StatCard icon={FiCalendar}   label="Today"           value={data?.today ?? 0}   color="#4F46E5" />
        <StatCard icon={FiTrendingUp} label="This Month"      value={data?.monthly ?? 0} color="#F59E0B" />
        <StatCard icon={FiStar}       label="This Year"       value={data?.yearly ?? 0}  color="#7C3AED" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10,10,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#gr)" name="Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Revenue by Ticket Type</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ticketBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#a0a0b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a0a0b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10,10,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="revenue" fill="#4F46E5" radius={[4,4,0,0]} name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Events Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Top Revenue Events</h3>
        {(data?.topEvents ?? []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#a0a0b8' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💰</div>
            <div>No revenue data yet</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['#','Event','Tickets Sold','Revenue'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: '#606080', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.topEvents ?? []).map((e: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#606080' }}>{i+1}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{e.event?.title ?? '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#a0a0b8' }}>{e.tickets ?? 0}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#10B981' }}>${(e.revenue ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
