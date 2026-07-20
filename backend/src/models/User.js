const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: {
      type: String,
      enum: ['attendee', 'admin'],
      default: 'attendee',
    },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    interests: [
      {
        type: String,
        enum: ['technology', 'ai', 'startups', 'gaming', 'music', 'sports', 'business', 'design', 'marketing', 'finance'],
      },
    ],
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      theme: { type: String, default: 'dark' },
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    suspendedReason: { type: String, default: '' },
    referralCode: { type: String, unique: true, sparse: true },
    rewardPoints: { type: Number, default: 0 },
    savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    lastLogin: { type: Date },
    loginHistory: [{ at: Date, ip: String }],
    // soft-delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
