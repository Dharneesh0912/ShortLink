const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  originalUrl: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  customAlias: {
    type: String,
    sparse: true,
    trim: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  totalClicks: {
    type: Number,
    default: 0,
  },
  lastClickedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Check if URL is expired
urlSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Increment click count
urlSchema.methods.incrementClicks = async function() {
  this.totalClicks += 1;
  this.lastClickedAt = new Date();
  await this.save();
  return this;
};

module.exports = mongoose.model('Url', urlSchema);