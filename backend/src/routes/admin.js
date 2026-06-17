const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrganizers,
      totalEvents,
      totalTickets,
      totalRevenue,
      recentUsers,
      recentEvents,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'organizer' }),
      Event.countDocuments(),
      Ticket.countDocuments(),
      Ticket.aggregate([
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
      User.find().sort({ createdAt: -1 }).limit(10).select('name email role createdAt'),
      Event.find().sort({ createdAt: -1 }).limit(10).populate('organizer', 'name email'),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalOrganizers,
        totalEvents,
        totalTickets,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentUsers,
      recentEvents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({ users, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Moderate event
router.put('/events/:id/moderate', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get revenue analytics
router.get('/analytics/revenue', async (req, res) => {
  try {
    const revenueByMonth = await Ticket.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$price' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const eventsByCategory = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ revenueByMonth, eventsByCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// System monitoring
router.get('/monitoring', async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);

    const [
      usersLast24h,
      eventsLast24h,
      ticketsLast24h,
      activeEvents,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: last24h } }),
      Event.countDocuments({ createdAt: { $gte: last24h } }),
      Ticket.countDocuments({ createdAt: { $gte: last24h } }),
      Event.countDocuments({ status: 'published', 'dateTime.startDate': { $gte: now } }),
    ]);

    res.json({
      metrics: {
        usersLast24h,
        eventsLast24h,
        ticketsLast24h,
        activeEvents,
        systemHealth: 'healthy',
        uptime: process.uptime(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;