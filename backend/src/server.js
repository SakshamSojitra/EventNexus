const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const bookingRoutes = require('./routes/bookings');

dotenv.config({ path: './.env' });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('user:online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('users:online-count', onlineUsers.size);
  });

  socket.on('event:join', (eventId) => {
    socket.join(`event:${eventId}`);
    const room = io.sockets.adapter.rooms.get(`event:${eventId}`);
    const count = room ? room.size : 0;
    io.to(`event:${eventId}`).emit('event:attendee-count', count);
  });

  socket.on('event:leave', (eventId) => {
    socket.leave(`event:${eventId}`);
    const room = io.sockets.adapter.rooms.get(`event:${eventId}`);
    const count = room ? room.size : 0;
    io.to(`event:${eventId}`).emit('event:attendee-count', count);
  });

  socket.on('chat:message', (data) => {
    io.to(`event:${data.eventId}`).emit('chat:message', data);
  });

  socket.on('ticket:purchase', (data) => {
    io.to(`event:${data.eventId}`).emit('ticket:sold', data);
    io.emit('notification:ticket-sold', data);
  });

  socket.on('event:announcement', (data) => {
    io.to(`event:${data.eventId}`).emit('event:announcement', data);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('users:online-count', onlineUsers.size);
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server initialized`);
});

module.exports = { app, server, io };