const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatMessageSchema.index({ roomId: 1, timestamp: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
