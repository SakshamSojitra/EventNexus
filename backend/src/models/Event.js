const mongoose = require('mongoose');

const ticketTierSchema = new mongoose.Schema({
  type: { type: String, enum: ['free', 'general', 'vip', 'student', 'early_bird'], required: true },
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  quantity: { type: Number, required: true },
  sold: { type: Number, default: 0 },
  description: { type: String, default: '' },
  benefits: [String],
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    category: { type: String, required: true },
    tags: [String],
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    banner: { type: String, default: '' },
    gallery: [String],
    venue: {
      name: { type: String, required: true },
      address: { type: String, default: '' },
      city: { type: String, required: true },
      country: { type: String, default: '' },
      coordinates: { lat: Number, lng: Number },
    },
    dateTime: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
    schedule: [
      {
        title: String,
        description: String,
        startTime: String,
        endTime: String,
        date: Date,
        speaker: String,
      },
    ],
    speakers: [
      {
        name: { type: String, required: true },
        title: String,
        company: String,
        avatar: String,
        bio: String,
        socialLinks: { linkedin: String, twitter: String, website: String },
      },
    ],
    sponsors: [
      {
        name: String,
        logo: String,
        website: String,
        tier: { type: String, enum: ['gold', 'silver', 'bronze'], default: 'bronze' },
      },
    ],
    tickets: [ticketTierSchema],
    capacity: { type: Number, required: true },
    attendees: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        ticketType: String,
        purchasedAt: { type: Date, default: Date.now },
      },
    ],
    waitlist: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, joinedAt: Date }],
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed', 'archived'],
      default: 'draft',
    },
    featured: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    registrationOpen: { type: Boolean, default: true },
    popularity: { type: Number, default: 0 },
    faq: [{ question: String, answer: String }],
    refundPolicy: { type: String, default: '' },
    ageRestriction: { type: Number, default: 0 },
    dressCode: { type: String, default: '' },
    termsAndConditions: { type: String, default: '' },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        isHidden: { type: Boolean, default: false },
        isPinned: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // soft delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ 'dateTime.startDate': 1 });

module.exports = mongoose.model('Event', eventSchema);
