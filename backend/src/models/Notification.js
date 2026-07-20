const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['announcement', 'promotion', 'maintenance', 'event_reminder', 'push', 'email', 'info', 'success', 'warning', 'error'],
      default: 'announcement',
    },
    target: {
      type: String,
      enum: ['all', 'specific', 'event_participants'],
      default: 'all',
    },
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    targetEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    scheduledAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    isSent: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
