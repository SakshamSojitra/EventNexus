const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// ── helpers ────────────────────────────────────────────────
const audit = (req, action, target, details) =>
  AuditLog.create({ admin: req.user._id, action, target, details, ip: req.ip }).catch(() => {});

// ── DASHBOARD ──────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers, totalEvents, totalBookings,
      upcomingEvents, completedEvents, cancelledEvents,
      todayEvents, totalRevenueAgg, monthlyRevenueAgg,
      ticketsSold, recentBookings, recentUsers, topEvents,
    ] = await Promise.all([
      User.countDocuments({ role: 'attendee', deletedAt: null }),
      Event.countDocuments({ deletedAt: null }),
      Booking.countDocuments({ deletedAt: null }),
      Event.countDocuments({ status: 'published', 'dateTime.startDate': { $gte: now }, deletedAt: null }),
      Event.countDocuments({ status: 'completed', deletedAt: null }),
      Event.countDocuments({ status: 'cancelled', deletedAt: null }),
      Event.countDocuments({ 'dateTime.startDate': { $gte: startOfToday, $lt: new Date(startOfToday.getTime() + 86400000) }, deletedAt: null }),
      Booking.aggregate([{ $match: { paymentStatus: 'paid', deletedAt: null } }, { $group: { _id: null, total: { $sum: '$price' } } }]),
      Booking.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth }, deletedAt: null } }, { $group: { _id: null, total: { $sum: '$price' } } }]),
      Booking.countDocuments({ bookingStatus: 'confirmed', deletedAt: null }),
      Booking.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(8).populate('user', 'name email avatar').populate('event', 'title banner'),
      User.find({ role: 'attendee', deletedAt: null }).sort({ createdAt: -1 }).limit(8).select('name email avatar createdAt'),
      Booking.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$event', count: { $sum: 1 }, revenue: { $sum: '$price' } } },
        { $sort: { count: -1 } }, { $limit: 5 },
        { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
        { $unwind: '$event' },
      ]),
    ]);

    res.json({
      stats: {
        totalUsers, totalEvents, totalBookings, upcomingEvents,
        completedEvents, cancelledEvents, todayEvents, ticketsSold,
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
      },
      recentBookings, recentUsers, topEvents,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ANALYTICS ─────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const revenueByMonth = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', deletedAt: null } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$price' }, bookings: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 },
    ]);

    const bookingsByMonth = await Booking.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 },
    ]);

    const categoryDist = await Event.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const userGrowth = await User.aggregate([
      { $match: { role: 'attendee', deletedAt: null } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 },
    ]);

    const ticketTypeBreakdown = await Booking.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$ticketType', count: { $sum: 1 }, revenue: { $sum: '$price' } } },
    ]);

    res.json({ revenueByMonth, bookingsByMonth, categoryDist, userGrowth, ticketTypeBreakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── EVENT MANAGEMENT ──────────────────────────────────────
router.get('/events', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search, featured } = req.query;
    const q = { deletedAt: null };
    if (status) q.status = status;
    if (category) q.category = category;
    if (featured === 'true') q.featured = true;
    if (search) q.$text = { $search: search };

    const events = await Event.find(q)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(q);
    res.json({ events, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/events', async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    await audit(req, 'CREATE_EVENT', `Event:${event._id}`, { title: event.title });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await audit(req, 'UPDATE_EVENT', `Event:${event._id}`, req.body);
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    await audit(req, 'DELETE_EVENT', `Event:${req.params.id}`, {});
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk event status update
router.put('/events/bulk/status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    await Event.updateMany({ _id: { $in: ids } }, { status });
    await audit(req, 'BULK_UPDATE_EVENTS', 'Events', { ids, status });
    res.json({ message: `${ids.length} events updated` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── USER MANAGEMENT ───────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, sort = '-createdAt' } = req.query;
    const q = { role: 'attendee', deletedAt: null };
    if (search) q.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (status === 'active') q.isActive = true;
    if (status === 'suspended') q.isSuspended = true;

    const users = await User.find(q)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(q);
    res.json({ users, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const bookings = await Booking.find({ user: req.params.id, deletedAt: null })
      .populate('event', 'title dateTime banner').sort({ createdAt: -1 });
    res.json({ user, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { action, reason } = req.body; // 'activate' | 'deactivate' | 'suspend' | 'unsuspend' | 'ban'
    const update = {};
    if (action === 'deactivate') update.isActive = false;
    if (action === 'activate') update.isActive = true;
    if (action === 'suspend') { update.isSuspended = true; update.suspendedReason = reason || ''; }
    if (action === 'unsuspend') { update.isSuspended = false; update.suspendedReason = ''; }
    if (action === 'ban') update.isBanned = true;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    await audit(req, `USER_${action.toUpperCase()}`, `User:${req.params.id}`, { reason });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    await audit(req, 'DELETE_USER', `User:${req.params.id}`, {});
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── BOOKING MANAGEMENT ────────────────────────────────────
router.get('/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, event, from, to } = req.query;
    const q = { deletedAt: null };
    if (status) q.bookingStatus = status;
    if (event) q.event = event;
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }

    let pipeline = [
      { $match: q },
      {
        $lookup: {
          from: 'users', localField: 'user', foreignField: '_id',
          as: 'user', pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }],
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmpty: true } },
      {
        $lookup: {
          from: 'events', localField: 'event', foreignField: '_id',
          as: 'event', pipeline: [{ $project: { title: 1, banner: 1, dateTime: 1 } }],
        },
      },
      { $unwind: { path: '$event', preserveNullAndEmpty: true } },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
            { ticketNumber: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: (page - 1) * parseInt(limit) });
    pipeline.push({ $limit: parseInt(limit) });

    const [bookings, countResult] = await Promise.all([
      Booking.aggregate(pipeline),
      Booking.aggregate(countPipeline),
    ]);

    res.json({ bookings, total: countResult[0]?.total || 0, totalPages: Math.ceil((countResult[0]?.total || 0) / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status, refundReason } = req.body;
    const update = { bookingStatus: status };
    if (status === 'refunded') { update.refundedAt = new Date(); update.refundReason = refundReason || ''; update.paymentStatus = 'refunded'; }
    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await audit(req, 'UPDATE_BOOKING', `Booking:${req.params.id}`, { status });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── CATEGORY MANAGEMENT ───────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ deletedAt: null }).sort({ sortOrder: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const body = { ...req.body };
    // auto-generate slug from name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const category = await Category.create(body);
    await audit(req, 'CREATE_CATEGORY', `Category:${category._id}`, { name: category.name });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const category = await Category.findByIdAndUpdate(req.params.id, body, { new: true });
    await audit(req, 'UPDATE_CATEGORY', `Category:${req.params.id}`, body);
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    await audit(req, 'DELETE_CATEGORY', `Category:${req.params.id}`, {});
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── COUPON MANAGEMENT ─────────────────────────────────────
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find({ deletedAt: null }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    // Normalise frontend field names → schema field names
    const { discountType, discountValue, maxUses, ...rest } = req.body;
    const payload = {
      ...rest,
      type:        discountType ?? rest.type,
      value:       discountValue ?? rest.value,
      usageLimit:  maxUses       ?? rest.usageLimit ?? 100,
      createdBy:   req.user._id,
    };
    const coupon = await Coupon.create(payload);
    await audit(req, 'CREATE_COUPON', `Coupon:${coupon._id}`, { code: coupon.code });
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/coupons/:id', async (req, res) => {
  try {
    const { discountType, discountValue, maxUses, ...rest } = req.body;
    const payload = {
      ...rest,
      ...(discountType  !== undefined && { type: discountType }),
      ...(discountValue !== undefined && { value: discountValue }),
      ...(maxUses       !== undefined && { usageLimit: maxUses }),
    };
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── NOTIFICATIONS ─────────────────────────────────────────
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const notif = await Notification.create({ ...req.body, createdBy: req.user._id });
    // Broadcast via socket.io
    const io = req.app.get('io');
    if (notif.target === 'all') io.emit('admin:notification', notif);
    await audit(req, 'SEND_NOTIFICATION', `Notification:${notif._id}`, { title: notif.title });
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── REVIEWS ───────────────────────────────────────────────
router.get('/reviews', async (req, res) => {
  try {
    const events = await Event.find({ 'reviews.0': { $exists: true }, deletedAt: null })
      .select('title reviews')
      .populate('reviews.user', 'name avatar');
    const reviews = [];
    events.forEach((e) =>
      e.reviews.forEach((r) => reviews.push({ ...r.toObject(), eventTitle: e.title, eventId: e._id }))
    );
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/reviews/:eventId/:reviewId', async (req, res) => {
  try {
    const { action } = req.body; // 'hide' | 'show' | 'pin' | 'delete'
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const review = event.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (action === 'hide') review.isHidden = true;
    if (action === 'show') review.isHidden = false;
    if (action === 'pin') review.isPinned = !review.isPinned;
    if (action === 'delete') review.deleteOne();
    await event.save();
    await audit(req, `REVIEW_${action.toUpperCase()}`, `Review:${req.params.reviewId}`, {});
    res.json({ message: 'Review updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── AUDIT LOGS ────────────────────────────────────────────
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await AuditLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await AuditLog.countDocuments();
    res.json({ logs, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── REVENUE ───────────────────────────────────────────────
router.get('/revenue', async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [total, today, monthly, yearly, topEvents] = await Promise.all([
      Booking.aggregate([{ $match: { paymentStatus: 'paid', deletedAt: null } }, { $group: { _id: null, v: { $sum: '$price' } } }]),
      Booking.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfToday }, deletedAt: null } }, { $group: { _id: null, v: { $sum: '$price' } } }]),
      Booking.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth }, deletedAt: null } }, { $group: { _id: null, v: { $sum: '$price' } } }]),
      Booking.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfYear }, deletedAt: null } }, { $group: { _id: null, v: { $sum: '$price' } } }]),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid', deletedAt: null } },
        { $group: { _id: '$event', revenue: { $sum: '$price' }, tickets: { $sum: 1 } } },
        { $sort: { revenue: -1 } }, { $limit: 10 },
        { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
        { $unwind: '$event' },
        { $project: { 'event.title': 1, 'event.banner': 1, revenue: 1, tickets: 1 } },
      ]),
    ]);

    res.json({
      total: total[0]?.v || 0,
      today: today[0]?.v || 0,
      monthly: monthly[0]?.v || 0,
      yearly: yearly[0]?.v || 0,
      topEvents,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
