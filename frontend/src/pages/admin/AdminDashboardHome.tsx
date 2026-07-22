import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  FiUsers, FiCalendar, FiDollarSign, FiBookOpen,
  FiTrendingUp, FiActivity, FiAward, FiClock,
} from 'react-icons/fi';
import API from '../../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#4F46E5','#7C3AED','#06B6D4','#10B981','#F59E0B','#EF4444'];

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }: any) {
  const [count, setCount] = useState(0);
  const numeric = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const prefix = String(value).startsWith('₹') ? '₹' : '';

  useEffect(() => {
    let start = 0;
    const step = numeric / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= numeric) { setCount(numeric); clearInterval(t); }
      else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(t);
  }, [numeric]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${color}15` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} style={{ color }} />
        </div>
        {sub && <span style={{ fontSize: 11, color: '#10B981', padding: '2px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: 20 }}>{sub}</span>}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
        {prefix}{count.toLocaleString()}
      </div>
      <div style={{ fontSize: 13, color: '#a0a0b8', marginTop: 4 }}>{label}</div>
    </motion.div>
  );
}

export default function AdminDashboardHome() {
  const [data, setData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/admin/dashboard'), API.get('/admin/analytics')])
      .then(([d, a]) => { setData(d.data); setAnalytics(a.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const revenueChart = (analytics?.revenueByMonth || []).map((r: any) => ({
    name: MONTHS[(r._id?.month || 1) - 1],
    revenue: r.revenue || 0,
    bookings: r.bookings || 0,
  }));

  const userGrowth = (analytics?.userGrowth || []).map((r: any) => ({
    name: MONTHS[(r._id?.month || 1) - 1],
    users: r.count || 0,
  }));

  const categoryChart = (analytics?.categoryDist || []).map((c: any, i: number) => ({
    name: c._id, value: c.count, fill: COLORS[i % COLORS.length],
  }));

  const stats = data?.stats || {};

  return (
    <div style={{ maxWidth: 1400 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 14, color: '#a0a0b8' }}>Welcome back — here's what's happening today.</p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {Array(8).fill(0).map((_, i) => (
            <div key={i} style={{ height: 120, borderRadius: 16, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard icon={FiUsers}      label="Total Users"       value={stats.totalUsers || 0}                              sub="Attendees" color="#4F46E5" delay={0} />
            <StatCard icon={FiCalendar}   label="Total Events"      value={stats.totalEvents || 0}                             color="#7C3AED" delay={0.05} />
            <StatCard icon={FiBookOpen}   label="Total Bookings"    value={stats.totalBookings || 0}                           color="#06B6D4" delay={0.1} />
            <StatCard icon={FiDollarSign} label="Total Revenue"     value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}   color="#10B981" delay={0.15} />
            <StatCard icon={FiTrendingUp} label="Monthly Revenue"   value={`₹${(stats.monthlyRevenue || 0).toLocaleString()}`} color="#F59E0B" delay={0.2} />
            <StatCard icon={FiActivity}   label="Tickets Sold"      value={stats.ticketsSold || 0}                             color="#EF4444" delay={0.25} />
            <StatCard icon={FiAward}      label="Upcoming Events"   value={stats.upcomingEvents || 0}                          color="#4F46E5" delay={0.3} />
            <StatCard icon={FiClock}      label="Today's Events"    value={stats.todayEvents || 0}                             color="#06B6D4" delay={0.35} />
          </div>

          {/* Charts row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Revenue & Bookings</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(10,10,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#rev)" name="Revenue (₹)" />
                  <Area type="monotone" dataKey="bookings" stroke="#06B6D4" strokeWidth={2} fill="none" name="Bookings" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Categories</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryChart} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {categoryChart.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(10,10,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {categoryChart.slice(0, 4).map((c: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a0a0b8' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c.fill }} />
                    {c.name}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Charts row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>User Growth</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#a0a0b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(10,10,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="users" fill="#7C3AED" radius={[4, 4, 0, 0]} name="New Users" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Recent Bookings</h3>
              {(data?.recentBookings || []).slice(0, 5).map((b: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                      {b.user?.name?.[0] || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{b.user?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 11, color: '#a0a0b8' }}>{b.event?.title || 'N/A'}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: b.bookingStatus === 'confirmed' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: b.bookingStatus === 'confirmed' ? '#10B981' : '#ef4444' }}>
                    {b.bookingStatus}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Recent Users + Top Events */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Recent Users</h3>
              {(data?.recentUsers || []).slice(0, 6).map((u: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #06B6D4, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {u.name?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: '#a0a0b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  </div>
                  <div style={{ fontSize: 10, color: '#a0a0b8' }}>{new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
              style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Top Events</h3>
              {(data?.topEvents || []).slice(0, 5).map((e: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: `${COLORS[i]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: COLORS[i] }}>{i + 1}</div>
                    <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{e.event?.title || 'N/A'}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>₹{(e.revenue || 0).toLocaleString()}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
