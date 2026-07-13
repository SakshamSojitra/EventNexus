const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, default: () => uuidv4() },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false },
  ticketType: { type: String, enum: ['free', 'premium', 'vip'], required: true },
  price: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['free', 'paid', 'pending', 'failed'], default: 'free' },
  paymentMethod: { type: String, default: '' },
  transactionId: { type: String, default: '' },
  bookingStatus: { type: String, enum: ['confirmed', 'cancelled', 'pending', 'expired'], default: 'confirmed' },
  qrCode: { type: String, required: true },
  ticketNumber: { type: String, unique: true },
  eventDate: { type: Date, default: null },   // kept for legacy reference
}, { timestamps: true });

bookingSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.ticketNumber = `EVT-2026-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
