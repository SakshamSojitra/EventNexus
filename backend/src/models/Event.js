const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  category: {
    type: String,
    required: true,
    enum: ['technology', 'ai', 'startups', 'gaming', 'music', 'sports', 'business', 'design', 'marketing', 'finance'],
  },
  tags: [String],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  banner: {
    type: String,
    default: '',
  },
  poster: {
    type: String,
    default: '',
  },
  venue: {
    name: { type: String, required: true },
    address: { type: String, default: '' },
    city: { type: String, required: true },
    country: { type: String, default: '' },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  dateTime: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  schedule: [{
    title: String,
    description: String,
    speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startTime: String,
    endTime: String,
    date: Date,
  }],
  speakers: [{
    name: { type: String, required: true },
    title: String,
    company: String,
    avatar: String,
    bio: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String,
    },
  }],
  tickets: [{
    type: {
      type: String,
      enum: ['free', 'paid', 'vip', 'early_bird'],
      required: true,
    },
    name: String,
    price: Number,
    quantity: Number,
    sold: { type: Number, default: 0 },
    description: String,
    benefits: [String],
  }],
  capacity: {
    type: Number,
    required: true,
  },
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ticketType: String,
    purchasedAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
  },
  popularity: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  marketingContent: {
    tagline: String,
    highlights: [String],
    targetAudience: String,
    seoKeywords: [String],
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ 'dateTime.startDate': 1 });

module.exports = mongoose.model('Event', eventSchema);