import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './pages/admin/AdminLayout';

// Public pages
import Hero from './components/Hero';
import EventDiscovery from './components/EventDiscovery';
import Categories from './components/Categories';
import FeaturedSpeakers from './components/FeaturedSpeakers';
import Testimonials from './components/Testimonials';
import Sponsors from './components/Sponsors';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import MyTickets from './pages/MyTickets';
import Events from './pages/Events';

// Admin pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import AdminEvents from './pages/admin/AdminEvents';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminReviews from './pages/admin/AdminReviews';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

import { useStore } from './store/useStore';

export default function App() {
  const { checkAuth } = useStore();

  useEffect(() => { checkAuth(); }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,15,35,0.95)',
            color: '#fff',
            border: '1px solid rgba(79,70,229,0.3)',
            borderRadius: 12,
            backdropFilter: 'blur(12px)',
            fontSize: 14,
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* ── Admin login — standalone, no layout ── */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ── Admin pages — AdminLayout (sidebar + header, NO public navbar) ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index        element={<AdminDashboardHome />} />
          <Route path="dashboard"     element={<AdminDashboardHome />} />
          <Route path="events"        element={<AdminEvents />} />
          <Route path="bookings"      element={<AdminBookings />} />
          <Route path="users"         element={<AdminUsers />} />
          <Route path="categories"    element={<AdminCategories />} />
          <Route path="revenue"       element={<AdminRevenue />} />
          <Route path="analytics"     element={<AdminAnalytics />} />
          <Route path="reviews"       element={<AdminReviews />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="coupons"       element={<AdminCoupons />} />
          <Route path="reports"       element={<AdminReports />} />
          <Route path="settings"      element={<AdminSettings />} />
        </Route>

        {/* ── Public pages — PublicLayout (with Navbar) ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={
            <>
              <Hero />
              <EventDiscovery />
              <Categories />
              <FeaturedSpeakers />
              <Testimonials />
              <Sponsors />
            </>
          } />
          <Route path="/events"      element={<Events />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/organizer"   element={<OrganizerDashboard />} />
          <Route path="/event/:id"   element={<EventDetails />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/my-tickets"  element={<MyTickets />} />
        </Route>
      </Routes>
    </>
  );
}
