const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

const TICKET_PRICES = { free: 0, premium: 299, vip: 599 };

// Deletes expired bookings for a user and returns remaining ones
async function deleteExpiredAndFetch(userId) {
  const now = new Date();

  // Mark expired
  await Booking.updateMany(
    { user: userId, expiresAt: { $lte: now }, bookingStatus: 'confirmed' },
    { bookingStatus: 'expired' }
  );

  // Hard delete expired tickets
  await Booking.deleteMany({ user: userId, bookingStatus: 'expired' });

  return Booking.find({ user: userId })
    .populate('event', 'title dateTime venue banner category')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
}

// POST /api/book-ticket
router.post('/book-ticket', protect, async (req, res) => {
  try {
    const { eventId, ticketType, eventDate } = req.body;

    if (!['free', 'premium', 'vip'].includes(ticketType)) {
      return res.status(400).json({ message: 'Invalid ticket type' });
    }

    const event = await Event.findById(eventId).catch(() => null);
    const eventRef = event ? eventId : null;

    // Determine event end time: use provided eventDate, or event's endDate, or default 24h from now
    let eventEndDate = null;
    if (eventDate) {
      eventEndDate = new Date(eventDate);
    } else if (event?.dateTime?.endDate) {
      eventEndDate = new Date(event.dateTime.endDate);
    } else {
      // Demo: event ends 24 hours from now
      eventEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    // Grace period: ticket stays 1 hour after event ends, then auto-deletes
    const expiresAt = new Date(eventEndDate.getTime() + 60 * 60 * 1000);

    const price = TICKET_PRICES[ticketType];
    const bookingId = uuidv4();
    const rand = Math.floor(10000 + Math.random() * 90000);
    const ticketNumber = `EVT-2026-${rand}`;

    const qrData = JSON.stringify({ bookingId, ticketNumber, userName: req.user.name, ticketType, eventId });
    const qrCode = await QRCode.toDataURL(qrData);

    const transactionId = ticketType !== 'free'
      ? 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
      : '';

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      event: eventRef,
      ticketType,
      price,
      paymentStatus: ticketType === 'free' ? 'free' : 'paid',
      paymentMethod: ticketType === 'free' ? '' : 'Demo Payment',
      transactionId,
      bookingStatus: 'confirmed',
      qrCode,
      ticketNumber,
      eventDate: eventEndDate,
      expiresAt,
    });

    const populated = await Booking.findById(booking._id)
      .populate('event', 'title dateTime venue banner')
      .populate('user', 'name email phone');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/my-ticket — auto-deletes expired before returning
router.get('/my-ticket', protect, async (req, res) => {
  try {
    const bookings = await deleteExpiredAndFetch(req.user._id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/ticket/:bookingId
router.get('/ticket/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('event', 'title dateTime venue banner category')
      .populate('user', 'name email phone');

    if (!booking) return res.status(404).json({ message: 'Ticket not found' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
