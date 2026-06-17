const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

// Purchase ticket
router.post('/purchase', protect, async (req, res) => {
  try {
    const { eventId, ticketType, paymentInfo } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const ticketOption = event.tickets.find(t => t.type === ticketType);
    if (!ticketOption) {
      return res.status(400).json({ message: 'Invalid ticket type' });
    }

    if (ticketOption.sold >= ticketOption.quantity) {
      return res.status(400).json({ message: 'Tickets sold out' });
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      eventId: event._id,
      userId: req.user._id,
      ticketType,
      timestamp: Date.now(),
    });

    const qrCode = await QRCode.toDataURL(qrData);

    // Create ticket
    const ticket = await Ticket.create({
      user: req.user._id,
      event: eventId,
      ticketType,
      price: ticketOption.price,
      qrCode,
      qrCodeData: qrData,
      paymentInfo: {
        ...paymentInfo,
        amount: ticketOption.price,
        status: 'completed',
      },
    });

    // Update event attendees
    event.attendees.push({
      user: req.user._id,
      ticketType,
    });
    ticketOption.sold += 1;
    await event.save();

    // Emit socket event
    const io = req.app.get('io');
    io.emit('ticket:purchase', {
      eventId,
      ticketType,
      count: ticketOption.sold,
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user tickets
router.get('/my-tickets', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('event', 'title dateTime venue banner')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single ticket
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate ticket (for QR scanning)
router.post('/validate', protect, authorize('admin', 'organizer'), async (req, res) => {
  try {
    const { qrData } = req.body;
    const data = JSON.parse(qrData);

    const ticket = await Ticket.findOne({
      event: data.eventId,
      user: data.userId,
      ticketType: data.ticketType,
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Invalid ticket' });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ message: 'Ticket already used' });
    }

    ticket.status = 'used';
    ticket.usedAt = Date.now();
    await ticket.save();

    res.json({ message: 'Ticket validated successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;