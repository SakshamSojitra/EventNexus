const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, default: () => randomUUID() },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false },
    ticketType: { type: String, enum: ['free', 'general', 'vip', 'student', 'early_bird', 'premium'], required: true },
    price: { type: Number, default: 0 },
    couponUsed: { type: String, default: '' },
    discountAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['free', 'paid', 'pending', 'failed', 'refunded'], default: 'free' },
    paymentMethod: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending', 'expired', 'refund_pending', 'refunded'],
      default: 'confirmed',
    },
    refundReason: { type: String, default: '' },
    refundedAt: { type: Date, default: null },
    qrCode: { type: String, required: true },
    ticketNumber: { type: String, unique: true },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    eventDate: { type: Date, default: null },
    // soft delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bookingSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.ticketNumber = `EVT-${Date.now().toString(36).toUpperCase()}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
