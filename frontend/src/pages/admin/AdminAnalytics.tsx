import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import API from '../../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#4F46E5','#7C3AED','#06B6D4','#10B981','#F59E0B','#EF4444'];
const CARD = { padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' };
const TT = { contentStyle: { background: 'rgba(10,10,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' } };

export default function AdminAnalytics() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/analytics').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {Array(4).fill(0).map((_,i) => <div key={i} style={{ height: 300, borderRadius: 16, background: 'rgba(255,255,255,0.04)' }} />)}
    </div>
  );

  const revenueChart = (data?.revenueByMonth ?? []).map((r: any) => ({
    name: MONTHS[(r._id?.month ?? 1) - 1], revenue: r.revenue ?? 0, bookings: r.bookings ?? 0,
  }));
  const userChart = (data?.userGrowth ?? []).map((r: any) => ({
    name: MONTHS[(r._id?.month ?? 1) - 1], users: r.count ?? 0,
  }));
  const catChart = (data?.categoryDist ?? []).map((c: any, i: number) => ({
    name: c._id ?? 'Unknown', value: c.count ?? 0, fill: COLORS[i % COLORS.length],
  }));
  const ticketChart = (data?.ticketTypeBreakdown ?? []).map((t: any) => ({
    name: t._id ?? 'Unknown', count: t.count ?? 0, revenue: t.revenue ?? 0,
  }));

  return (
    <div style={{ maxWidth: 1400 }}>
      <p style={{ fontSize: 14, color: '#a0a0b8', marginBottom: 24 }}>Platform performance over the last 12 months</p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={CARD}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Revenue & Bookings Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueChart}>
              <defs>
                <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} /><stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Area type="monotone" dataKey="revenue"  stroke="#4F46E5" strokeWidth={2} fill="url(#a1)" name="Revenue (₹)" />
              <Area type="monotone" dataKey="bookings" stroke="#06B6D4" strokeWidth={2} fill="none"       name="Bookings" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={CARD}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Events by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={catChart} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {catChart.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip {...TT} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {catChart.slice(0,5).map((c: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#a0a0b8' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c.fill }} />{c.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={CARD}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>User Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={userChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Line type="monotone" dataKey="users" stroke="#7C3AED" strokeWidth={2.5} dot={{ fill: '#7C3AED', r: 3 }} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={CARD}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Bookings by Ticket Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ticketChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Bar dataKey="count" fill="#06B6D4" radius={[4,4,0,0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
