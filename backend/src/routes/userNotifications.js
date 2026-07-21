const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

// All routes require authentication
router.use(protect);

// GET /api/user/notifications
router.get('/', getUserNotifications);

// GET /api/user/notifications/unread-count
router.get('/unread-count', getUnreadCount);

// PATCH /api/user/notifications/read-all
router.patch('/read-all', markAllAsRead);

// PATCH /api/user/notifications/:id/read
router.patch('/:id/read', markAsRead);

// DELETE /api/user/notifications/:id
router.delete('/:id', deleteNotification);

module.exports = router;