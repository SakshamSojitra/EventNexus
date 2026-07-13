const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, featured } = req.query;
    const query = { status: 'published' };

    if (category) query.category = category;
    if (featured) query.featured = true;
    if (search) {
      query.$text = { $search: search };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email avatar')
      .sort({ popularity: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar')
      .populate('attendees.user', 'name email avatar');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Increment popularity
    event.popularity += 1;
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id,
      status: req.body.status || 'published',
    };
    const event = await Event.create(eventData);
    const populated = await Event.findById(event._id).populate('organizer', 'name email avatar');
    res.status(201).json(populated);
  } catch (error) {
    console.error('[CreateEvent Error]', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Update event
router.put('/:id', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get events by organizer
router.get('/organizer/:organizerId', async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.params.organizerId })
      .populate('organizer', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add review
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const review = {
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    };

    event.reviews.push(review);
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AI Generate Event
router.post('/ai-generate', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Simulated AI generation - in production, this would call OpenAI
    const generatedEvent = {
      title: `${prompt} - AI Generated Event`,
      description: `An exciting ${prompt} event featuring industry leaders, interactive sessions, and networking opportunities. Join us for an unforgettable experience.`,
      tags: [prompt.toLowerCase(), 'technology', 'innovation'],
      aiGenerated: true,
      marketingContent: {
        tagline: `Experience the Future of ${prompt}`,
        highlights: [
          'Expert speakers from top companies',
          'Hands-on workshops',
          'Networking opportunities',
          'Exclusive insights',
        ],
        targetAudience: 'Tech professionals, enthusiasts, and innovators',
        seoKeywords: [prompt, 'event', 'conference', 'technology'],
      },
    };

    res.json(generatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;