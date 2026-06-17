const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/auth');

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -resetPasswordToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save event
router.post('/save-event/:eventId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const eventId = req.params.eventId;

    if (user.savedEvents.includes(eventId)) {
      user.savedEvents = user.savedEvents.filter(id => id.toString() !== eventId);
    } else {
      user.savedEvents.push(eventId);
    }

    await user.save();
    res.json({ savedEvents: user.savedEvents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send networking request
router.post('/networking/request/:userId', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    targetUser.networkingRequests.push({
      from: req.user._id,
      message: req.body.message,
    });

    await targetUser.save();
    res.json({ message: 'Networking request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept/Decline networking request
router.put('/networking/respond/:requestId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const request = user.networkingRequests.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = req.body.status;
    await user.save();

    res.json({ message: `Request ${req.body.status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get AI recommendations
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Find events matching user interests
    const recommendations = await Event.find({
      status: 'published',
      category: { $in: user.interests },
      _id: { $nin: user.savedEvents },
    })
      .populate('organizer', 'name avatar')
      .limit(10)
      .sort({ popularity: -1 });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const totalEvents = await Event.countDocuments({ organizer: userId });
    const totalTickets = await Ticket.countDocuments({ user: userId });
    const userData = await User.findById(userId);
    const savedEventsCount = userData.savedEvents.length;
    const acceptedNetworking = userData.networkingRequests.filter(r => r.status === 'accepted').length;

    res.json({
      totalEvents,
      totalTickets,
      savedEvents: savedEventsCount,
      networkingCount: acceptedNetworking,
      rewardPoints: userData.rewardPoints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;