const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  ticketType: {
    type: String,
    enum: ['free', 'paid', 'vip', 'early_bird'],
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  qrCode: {
    type: String,
    required: true,
  },
  qrCodeData: {
    type: String,
    required: true,
  },
  ticketId: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled', 'refunded'],
    default: 'active',
  },
  paymentInfo: {
    stripePaymentId: String,
    amount: Number,
    currency: { type: String, default: 'usd' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  },
  usedAt: Date,
  cancelledAt: Date,
}, {
  timestamps: true,
});

ticketSchema.pre('save', function(next) {
  if (!this.ticketId) {
    this.ticketId = 'TKT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);