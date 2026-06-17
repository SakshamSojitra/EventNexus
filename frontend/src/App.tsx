import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EventDiscovery from './components/EventDiscovery';
import Categories from './components/Categories';
import FeaturedSpeakers from './components/FeaturedSpeakers';
import Testimonials from './components/Testimonials';
import Sponsors from './components/Sponsors';
import AnimatedBackground from './components/AnimatedBackground';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import EventDetails from './pages/EventDetails';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import MyTickets from './pages/MyTickets';
import Events from './pages/Events';
import { useStore } from './store/useStore';

function App() {
  const { isAuthenticated, user, checkAuth } = useStore();
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div
        className="cursor-glow"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
        }}
      />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <EventDiscovery />
              <AnimatedBackground>
                <Categories />
              </AnimatedBackground>
              <AnimatedBackground>
                <FeaturedSpeakers />
              </AnimatedBackground>
              <Testimonials />
              <Sponsors />
            </>
          }
        />
        <Route path="/events" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/my-tickets" element={<MyTickets />} />
      </Routes>
    </>
  );
}

export default App;