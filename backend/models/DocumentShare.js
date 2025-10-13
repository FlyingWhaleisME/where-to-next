const mongoose = require('mongoose');

const DocumentShareSchema = new mongoose.Schema({
  shareCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  documentId: {
    type: String,
    required: true
  },
  documentData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  creatorId: {
    type: String,
    required: true
  },
  creatorName: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date
  },
  accessCount: {
    type: Number,
    default: 0
  }
});

// Index for efficient lookups
DocumentShareSchema.index({ shareCode: 1 });
DocumentShareSchema.index({ creatorId: 1 });
DocumentShareSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('DocumentShare', DocumentShareSchema);
