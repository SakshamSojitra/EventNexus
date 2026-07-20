const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

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

// Connect DB then seed admin
connectDB().then(seedAdmin);

async function seedAdmin() {
  try {
    const User = require('./models/User');
    const existing = await User.findOne({ email: 'admin@eventnexus.com' });
    if (!existing) {
      await User.create({
        name: 'Admin',
        email: 'admin@eventnexus.com',
        password: 'Admin@123',
        role: 'admin',
        isVerified: true,
      });
      console.log('✅ Default admin created: admin@eventnexus.com / Admin@123');
    }
  } catch (e) {
    console.error('Admin seed error:', e.message);
  }
}

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/bookings'));

app.get('/api/health', (_req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));

// Socket.io
const onlineUsers = new Map();
io.on('connection', (socket) => {
  socket.on('user:online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('users:online-count', onlineUsers.size);
  });
  socket.on('event:join', (eventId) => {
    socket.join(`event:${eventId}`);
    const count = io.sockets.adapter.rooms.get(`event:${eventId}`)?.size || 0;
    io.to(`event:${eventId}`).emit('event:attendee-count', count);
  });
  socket.on('event:leave', (eventId) => {
    socket.leave(`event:${eventId}`);
    const count = io.sockets.adapter.rooms.get(`event:${eventId}`)?.size || 0;
    io.to(`event:${eventId}`).emit('event:attendee-count', count);
  });
  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) { onlineUsers.delete(uid); break; }
    }
    io.emit('users:online-count', onlineUsers.size);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
module.exports = { app, server, io };
