const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { randomUUID } = require('crypto');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

/**
 * Computes ticket status dynamically from event dateTime fields.
 * Returns 'upcoming' | 'live' | 'expired'
 */
function computeTicketStatus(event) {
  if (!event || !event.dateTime) return 'upcoming';

  const { startDate, endDate, startTime, endTime } = event.dateTime;
  const now = new Date();

  function parseTime(timeStr) {
    if (!timeStr) return { h: 0, m: 0 };
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return { h: 0, m: 0 };
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return { h, m };
  }

  function buildDateTime(dateField, timeStr) {
    const base = new Date(dateField);
    const { h, m } = parseTime(timeStr);
    return new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m, 0);
  }

  const eventStart = buildDateTime(startDate, startTime);
  const eventEnd   = buildDateTime(endDate || startDate, endTime || startTime);

  if (now < eventStart) return 'upcoming';
  if (now >= eventStart && now <= eventEnd) return 'live';
  return 'expired';
}

/** Look up a ticket price from an event's tickets array, or fallback to defaults */
function resolveTicketPrice(event, ticketType) {
  if (event && event.tickets && Array.isArray(event.tickets)) {
    const matched = event.tickets.find(t => t.type === ticketType);
    if (matched && matched.price !== undefined) return matched.price;
  }
  const DEFAULTS = { free: 0, premium: 299, vip: 599, general: 49, student: 99, early_bird: 149 };
  return DEFAULTS[ticketType] || 0;
}

/** Attach computed ticketStatus to each booking object */
function withStatus(bookings) {
  return bookings.map((b) => {
    const obj = b.toObject();
    obj.ticketStatus = computeTicketStatus(obj.event);
    return obj;
  });
}

// POST /api/book-ticket
router.post('/book-ticket', protect, async (req, res) => {
  try {
    const { eventId, ticketType } = req.body;

    if (!ticketType || typeof ticketType !== 'string') {
      return res.status(400).json({ message: 'Invalid ticket type' });
    }

    const event = await Event.findById(eventId).catch(() => null);
    const eventRef = event ? eventId : null;

    const price = resolveTicketPrice(event, ticketType);
    const bookingId = randomUUID();
    const rand = Math.floor(10000 + Math.random() * 90000);
    const ticketNumber = `EVT-2026-${rand}`;

    const qrData = JSON.stringify({ bookingId, ticketNumber, userName: req.user.name, ticketType, eventId });
    const qrCode = await QRCode.toDataURL(qrData);

    const transactionId = price > 0
      ? 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
      : '';

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      event: eventRef,
      ticketType,
      price,
      paymentStatus: price === 0 ? 'free' : 'paid',
      paymentMethod: price === 0 ? '' : 'Demo Payment',
      transactionId,
      bookingStatus: 'confirmed',
      qrCode,
      ticketNumber,
      eventDate: event?.dateTime?.startDate || null,
    });

    const populated = await Booking.findById(booking._id)
      .populate('event', 'title dateTime venue banner')
      .populate('user', 'name email phone');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/my-ticket
router.get('/my-ticket', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title dateTime venue banner category')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(withStatus(bookings));
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
    const obj = booking.toObject();
    obj.ticketStatus = computeTicketStatus(obj.event);
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tickets/verify/:ticketId — public QR scan endpoint
router.get('/tickets/verify/:ticketId', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      $or: [
        { bookingId: req.params.ticketId },
        { ticketNumber: req.params.ticketId },
      ],
    })
      .populate('event', 'title dateTime venue banner category')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ status: 'invalid', message: 'Ticket not found.' });
    }

    const obj = booking.toObject();
    const ticketStatus = computeTicketStatus(obj.event);
    obj.ticketStatus = ticketStatus;

    res.json({
      status: ticketStatus === 'expired' ? 'expired' : 'verified',
      ticketStatus,
      booking: obj,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;