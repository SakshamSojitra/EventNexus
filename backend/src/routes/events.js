const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

// GET all published events (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, featured } = req.query;
    const q = { status: 'published', deletedAt: null };
    if (category) q.category = category;
    if (featured === 'true') q.featured = true;
    if (search) q.$text = { $search: search };

    const events = await Event.find(q)
      .populate('organizer', 'name email avatar')
      .sort({ popularity: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(q);
    res.json({ events, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single event (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, deletedAt: null })
      .populate('organizer', 'name email avatar')
      .populate('attendees.user', 'name avatar');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    event.popularity += 1;
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create event — admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id, status: req.body.status || 'published' });
    const populated = await Event.findById(event._id).populate('organizer', 'name email avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update event — admin only
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE event — admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add review (protected attendee)
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, deletedAt: null });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    event.reviews.push({ user: req.user._id, rating: req.body.rating, comment: req.body.comment });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
