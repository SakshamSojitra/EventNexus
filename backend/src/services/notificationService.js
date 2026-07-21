const Notification = require('../models/Notification');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { buildEmailTemplate, sendBatchEmails } = require('./emailService');

class NotificationService {
  /**
   * Determine recipients based on target type
   */
  async determineRecipients({ target, targetUsers, targetEvent }) {
    let recipients = [];

    switch (target) {
      case 'all':
        // Get all active users
        const allUsers = await User.find({
          isActive: true,
          isBanned: { $ne: true },
          deletedAt: null,
        }).select('_id');
        recipients = allUsers.map((u) => u._id);
        break;

      case 'specific':
        if (targetUsers && targetUsers.length > 0) {
          recipients = targetUsers;
        }
        break;

      case 'event_participants':
      case 'ticket_buyers':
      case 'attendees':
        if (targetEvent) {
          const bookings = await Booking.find({
            event: targetEvent,
            bookingStatus: 'confirmed',
            deletedAt: null,
          }).populate('user', '_id');
          recipients = [...new Set(bookings.map((b) => b.user?._id).filter(Boolean))];
        }
        break;

      case 'admin':
        const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
        recipients = admins.map((u) => u._id);
        break;

      case 'organizers':
        // Find users who have created events
        const organizers = await User.find({
          role: { $in: ['organizer', 'admin'] },
          isActive: true,
          deletedAt: null,
        }).select('_id');
        recipients = organizers.map((u) => u._id);
        break;

      default:
        recipients = [];
    }

    return recipients;
  }

  /**
   * Get user email and name for a recipient
   */
  async getUserDetails(userId) {
    const user = await User.findById(userId).select('name email notificationPreferences isEmailVerified');
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name || 'User',
      email: user.email,
      notificationPreferences: user.notificationPreferences || { email: true },
      isEmailVerified: user.isEmailVerified || false,
    };
  }

  /**
   * Send a notification
   */
  async sendNotification({ title, message, type, target, priority, targetUsers, targetEvent, createdBy, expiresAt, sender }) {
    // Determine recipients
    const recipientIds = await this.determineRecipients({ target, targetUsers, targetEvent });

    if (recipientIds.length === 0) {
      return {
        success: false,
        message: 'No recipients found for the selected target',
        notification: null,
      };
    }

    // Create user notifications array
    const userNotifications = recipientIds.map((userId) => ({
      user: userId,
      isRead: false,
      readAt: null,
      emailSent: false,
      emailSentAt: null,
      emailError: '',
    }));

    // Create the notification in MongoDB
    const notification = await Notification.create({
      title,
      message,
      type: type || 'information',
      target: target || 'all',
      priority: priority || 'medium',
      recipients: recipientIds,
      targetUsers: targetUsers || [],
      targetEvent: targetEvent || null,
      eventReference: targetEvent || null,
      sender: sender || 'EventNexus Admin',
      createdBy: createdBy,
      expiresAt: expiresAt || null,
      isSent: true,
      sentAt: new Date(),
      deliveryStatus: 'sent',
      emailStatus: 'pending',
      userNotifications,
    });

    return {
      success: true,
      message: `Notification sent to ${recipientIds.length} recipient(s)`,
      notification,
      recipientCount: recipientIds.length,
      recipientIds,
    };
  }

  /**
   * Send emails for a notification
   */
  async sendNotificationEmails(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return { success: false, message: 'Notification not found' };
    }

    const { recipients, title, message, type } = notification;
    const emailRecipients = [];
    const userMap = {};

    // Fetch user details in bulk
    const users = await User.find({
      _id: { $in: recipients },
      isActive: true,
      deletedAt: null,
    }).select('name email notificationPreferences isEmailVerified');

    for (const user of users) {
      // Check if user has email notifications enabled
      const emailPref = user.notificationPreferences?.email !== false;
      if (!emailPref || !user.email) continue;

      userMap[user._id.toString()] = user;
      const htmlContent = buildEmailTemplate({
        userName: user.name || 'User',
        notificationTitle: title,
        notificationMessage: message,
        notificationType: type,
        currentDate: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      });

      emailRecipients.push({
        to: user.email,
        subject: `[EventNexus] ${title}`,
        html: htmlContent,
        userId: user._id,
      });
    }

    if (emailRecipients.length === 0) {
      // Update email status - no emails to send
      await Notification.findByIdAndUpdate(notificationId, {
        emailStatus: 'sent',
      });
      return { success: true, message: 'No emails to send', sentCount: 0 };
    }

    // Send batch emails
    const results = await sendBatchEmails(emailRecipients, 5);

    // Update user notification email status
    const updateOps = [];
    let successCount = 0;
    let failCount = 0;

    for (const result of results) {
      if (result.success && result.userId) {
        updateOps.push({
          updateOne: {
            filter: { _id: notificationId, 'userNotifications.user': result.userId },
            update: {
              $set: {
                'userNotifications.$.emailSent': true,
                'userNotifications.$.emailSentAt': new Date(),
              },
            },
          },
        });
        successCount++;
      } else if (!result.success && result.userId) {
        updateOps.push({
          updateOne: {
            filter: { _id: notificationId, 'userNotifications.user': result.userId },
            update: {
              $set: {
                'userNotifications.$.emailSent': false,
                'userNotifications.$.emailError': result.error || 'Failed',
              },
            },
          },
        });
        failCount++;
      }
    }

    if (updateOps.length > 0) {
      await Notification.bulkWrite(updateOps);
    }

    // Update overall email status
    let emailStatus = 'sent';
    if (failCount > 0 && successCount === 0) emailStatus = 'failed';
    else if (failCount > 0) emailStatus = 'partial';

    await Notification.findByIdAndUpdate(notificationId, { emailStatus });

    return {
      success: true,
      message: `Emails sent: ${successCount}, Failed: ${failCount}`,
      sentCount: successCount,
      failedCount: failCount,
    };
  }

  /**
   * Mark notification as read for a user
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        'userNotifications.user': userId,
      },
      {
        $set: {
          'userNotifications.$.isRead': true,
          'userNotifications.$.readAt': new Date(),
        },
      },
      { new: true }
    );

    if (!notification) {
      // If notification doesn't have userNotifications entry, create it
      const updated = await Notification.findByIdAndUpdate(
        notificationId,
        {
          $push: {
            userNotifications: {
              user: userId,
              isRead: true,
              readAt: new Date(),
            },
          },
        },
        { new: true }
      );
      return updated;
    }

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      {
        recipients: userId,
        'userNotifications.user': userId,
        'userNotifications.isRead': false,
      },
      {
        $set: {
          'userNotifications.$.isRead': true,
          'userNotifications.$.readAt': new Date(),
        },
      }
    );
    return result;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const query = {
      recipients: userId,
      isSent: true,
    };

    if (unreadOnly) {
      query['userNotifications'] = {
        $elemMatch: { user: userId, isRead: false },
      };
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('title message type target priority sender createdAt updatedAt expiresAt userNotifications')
      .lean();

    // Attach user-specific read status
    const enriched = notifications.map((n) => {
      const userNotif = n.userNotifications?.find(
        (un) => un.user?.toString() === userId.toString()
      );
      return {
        ...n,
        isRead: userNotif?.isRead || false,
        readAt: userNotif?.readAt || null,
        emailSent: userNotif?.emailSent || false,
      };
    });

    return {
      notifications: enriched,
      total,
      unreadCount: enriched.filter((n) => !n.isRead).length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      recipients: userId,
      'userNotifications': {
        $elemMatch: { user: userId, isRead: false },
      },
    });
    return count;
  }

  /**
   * Delete a user notification
   */
  async deleteUserNotification(notificationId, userId) {
    // Remove user from recipients
    const result = await Notification.findByIdAndUpdate(
      notificationId,
      {
        $pull: {
          recipients: userId,
          userNotifications: { user: userId },
        },
      },
      { new: true }
    );
    return result;
  }

  /**
   * Get notification statistics for admin dashboard
   */
  async getStatistics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalNotifications,
      todayNotifications,
      totalSent,
      totalFailed,
      totalRead,
      totalUnread,
      emailStats,
      uniqueRecipients,
    ] = await Promise.all([
      Notification.countDocuments({ isSent: true }),
      Notification.countDocuments({ sentAt: { $gte: startOfToday } }),
      Notification.aggregate([
        { $match: { isSent: true } },
        { $group: { _id: null, total: { $sum: { $size: '$recipients' } } } },
      ]),
      Notification.countDocuments({ emailStatus: 'failed' }),
      Notification.aggregate([
        { $match: { 'userNotifications.isRead': true } },
        { $unwind: '$userNotifications' },
        { $match: { 'userNotifications.isRead': true } },
        { $count: 'count' },
      ]),
      Notification.aggregate([
        { $match: { 'userNotifications.isRead': false } },
        { $unwind: '$userNotifications' },
        { $match: { 'userNotifications.isRead': false } },
        { $count: 'count' },
      ]),
      Notification.aggregate([
        { $match: { isSent: true, emailStatus: { $ne: 'pending' } } },
        {
          $group: {
            _id: null,
            totalSent: { $sum: 1 },
            emailSent: { $sum: { $cond: [{ $eq: ['$emailStatus', 'sent'] }, 1, 0] } },
            emailFailed: { $sum: { $cond: [{ $in: ['$emailStatus', ['failed', 'partial']] }, 1, 0] } },
          },
        },
      ]),
      Notification.aggregate([
        { $match: { isSent: true } },
        { $unwind: '$recipients' },
        { $group: { _id: '$recipients' } },
        { $count: 'count' },
      ]),
    ]);

    return {
      totalNotifications: totalNotifications || 0,
      todayNotifications: todayNotifications || 0,
      totalRecipients: emailStats[0]?.totalSent || 0,
      emailsSent: emailStats[0]?.emailSent || 0,
      emailsFailed: emailStats[0]?.emailFailed || 0,
      failedNotifications: totalFailed || 0,
      totalRead: totalRead[0]?.count || 0,
      totalUnread: totalUnread[0]?.count || 0,
      uniqueRecipients: uniqueRecipients[0]?.count || 0,
      deliveryRate: totalNotifications > 0
        ? Math.round(((totalNotifications - totalFailed) / totalNotifications) * 100)
        : 100,
    };
  }
}

module.exports = new NotificationService();