const notificationService = require('../services/notificationService');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const audit = (req, action, target, details) =>
  AuditLog.create({ admin: req.user._id, action, target, details, ip: req.ip }).catch(() => {});

// ─── ADMIN CONTROLLERS ──────────────────────────────────────

/**
 * POST /api/admin/notifications/send
 * Send a notification (admin only)
 */
const sendNotification = async (req, res) => {
  try {
    const { title, message, type, target, priority, targetUsers, targetEvent, expiresAt } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Notification title is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Notification message is required' });
    }

    // Sanitize inputs
    const sanitizedTitle = title.trim();
    const sanitizedMessage = message.trim();

    // Send notification
    const result = await notificationService.sendNotification({
      title: sanitizedTitle,
      message: sanitizedMessage,
      type: type || 'information',
      target: target || 'all',
      priority: priority || 'medium',
      targetUsers: targetUsers || [],
      targetEvent: targetEvent || null,
      createdBy: req.user._id,
      expiresAt: expiresAt || null,
      sender: `${req.user.name || 'Admin'} (EventNexus)`,
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // Send emails asynchronously (don't block response)
    notificationService.sendNotificationEmails(result.notification._id).catch((err) => {
      console.error('[Notification] Email sending error:', err.message);
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('admin:notification', {
        _id: result.notification._id,
        title: sanitizedTitle,
        message: sanitizedMessage,
        type: type || 'information',
        target,
        priority: priority || 'medium',
        createdAt: result.notification.createdAt,
        sender: result.notification.sender,
      });
    }

    // Audit log
    await audit(req, 'SEND_NOTIFICATION', `Notification:${result.notification._id}`, {
      title: sanitizedTitle,
      target,
      recipientCount: result.recipientCount,
    });

    res.status(201).json({
      success: true,
      message: result.message,
      notification: result.notification,
      recipientCount: result.recipientCount,
    });
  } catch (err) {
    console.error('[Send Notification Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/notifications/history
 * Get notification history with search, filter, and pagination
 */
const getNotificationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, target, status, from, to } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }
    if (type) query.type = type;
    if (target) query.target = target;
    if (status === 'sent') query.isSent = true;
    if (status === 'failed') query.emailStatus = 'failed';
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('createdBy', 'name email')
      .populate('targetEvent', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    // Add computed fields
    const enriched = notifications.map((n) => ({
      ...n,
      recipientCount: n.recipients?.length || 0,
      readCount: n.userNotifications?.filter((un) => un.isRead).length || 0,
      emailSentCount: n.userNotifications?.filter((un) => un.emailSent).length || 0,
      emailFailedCount: n.userNotifications?.filter((un) => un.emailError).length || 0,
    }));

    res.json({
      success: true,
      notifications: enriched,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error('[Notification History Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/notifications/statistics
 * Get notification statistics for admin dashboard
 */
const getNotificationStatistics = async (req, res) => {
  try {
    const stats = await notificationService.getStatistics();
    res.json({ success: true, ...stats });
  } catch (err) {
    console.error('[Notification Stats Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/notifications/recipients/:id
 * Get recipients for a specific notification
 */
const getNotificationRecipients = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id)
      .populate('recipients', 'name email avatar')
      .lean();

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Enrich with read status
    const recipients = notification.recipients.map((recipient) => {
      const userNotif = notification.userNotifications?.find(
        (un) => un.user?.toString() === recipient._id.toString()
      );
      return {
        ...recipient,
        isRead: userNotif?.isRead || false,
        readAt: userNotif?.readAt || null,
        emailSent: userNotif?.emailSent || false,
      };
    });

    res.json({ success: true, recipients, total: recipients.length });
  } catch (err) {
    console.error('[Notification Recipients Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/admin/notifications/:id/resend
 * Resend failed emails for a notification
 */
const resendNotificationEmails = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notificationService.sendNotificationEmails(id);
    res.json({ success: true, message: result.message });
  } catch (err) {
    console.error('[Resend Emails Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── USER CONTROLLERS ───────────────────────────────────────

/**
 * GET /api/user/notifications
 * Get notifications for the authenticated user
 */
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;
    const result = await notificationService.getUserNotifications(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
    });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[User Notifications Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/user/notifications/unread-count
 * Get unread notification count
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.json({ success: true, unreadCount: count });
  } catch (err) {
    console.error('[Unread Count Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/user/notifications/:id/read
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Marked as read', notification });
  } catch (err) {
    console.error('[Mark Read Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/user/notifications/read-all
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error('[Mark All Read Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/user/notifications/:id
 * Delete a notification for the authenticated user
 */
const deleteNotification = async (req, res) => {
  try {
    const result = await notificationService.deleteUserNotification(req.params.id, req.user._id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    console.error('[Delete Notification Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  // Admin
  sendNotification,
  getNotificationHistory,
  getNotificationStatistics,
  getNotificationRecipients,
  resendNotificationEmails,
  // User
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};