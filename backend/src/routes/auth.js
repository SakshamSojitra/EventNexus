const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  referralCode: user.referralCode,
  isActive: user.isActive,
  isSuspended: user.isSuspended,
});

// POST /api/auth/register  — attendee only
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role: 'attendee', // forced — no organizer registration
      referralCode:
        name.substring(0, 3).toUpperCase() +
        Math.random().toString(36).substring(2, 8).toUpperCase(),
    });

    res.status(201).json({ token: signToken(user._id), user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login  — attendee / admin (general user login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    // Block admin from using the normal login endpoint
    if (user.role === 'admin')
      return res.status(403).json({ message: 'Please use the admin login page' });

    if (user.isSuspended)
      return res.status(403).json({ message: 'Your account has been suspended' });

    if (user.isActive === false)
      return res.status(403).json({ message: 'Your account is deactivated' });

    // Log login history
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.unshift({ at: new Date(), ip: req.ip });
    if (user.loginHistory.length > 20) user.loginHistory = user.loginHistory.slice(0, 20);
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({ token: signToken(user._id), user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/admin/login  — admin-only login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid admin credentials' });

    user.loginHistory = user.loginHistory || [];
    user.loginHistory.unshift({ at: new Date(), ip: req.ip });
    if (user.loginHistory.length > 20) user.loginHistory = user.loginHistory.slice(0, 20);
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({ token: signToken(user._id), user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedEvents');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, avatar, interests, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar, interests, preferences },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
