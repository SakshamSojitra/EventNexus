const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'information', 'success', 'warning', 'error', 'promotion',
        'reminder', 'system_update', 'event_update', 'booking_update',
        'payment_update', 'announcement', 'maintenance', 'event_reminder',
        'push', 'email',
      ],
      default: 'information',
    },
    target: {
      type: String,
      enum: [
        'all', 'specific', 'event_participants', 'ticket_buyers',
        'attendees', 'admin', 'organizers',
      ],
      default: 'all',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    targetEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    eventReference: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    bookingReference: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    sender: { type: String, default: 'EventNexus Admin' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduledAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    isSent: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed', 'partial'],
      default: 'pending',
    },
    emailStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'partial'],
      default: 'pending',
    },
    // For individual user notification tracking (user-specific read status)
    userNotifications: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date, default: null },
        emailSent: { type: Boolean, default: false },
        emailSentAt: { type: Date, default: null },
        emailError: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'userNotifications.user': 1, createdAt: -1 });
notificationSchema.index({ target: 1, isSent: 1 });

module.exports = mongoose.model('Notification', notificationSchema);