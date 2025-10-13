const mongoose = require('mongoose');

// Duration sub-schema (matches frontend Question2Duration.tsx)
const durationSchema = new mongoose.Schema({
  dates: {
    status: { type: String, enum: ['decided', 'in_mind', 'undecided', ''], default: '' },
    startDate: String,
    endDate: String,
    seasonPreference: { type: String, enum: ['peak', 'off', 'flexible', ''], default: '' }
  },
  duration: {
    status: { type: String, enum: ['decided', 'in_mind', 'undecided', ''], default: '' },
    days: String,
    weeks: String,
    months: String,
    minDays: String,
    minWeeks: String,
    minMonths: String,
    maxDays: String,
    maxWeeks: String,
    maxMonths: String
  }
});

// Destination approach sub-schema
const destinationApproachSchema = new mongoose.Schema({
  travelType: { type: String, enum: ['abroad', 'domestic', ''], default: '' },
  destinationStatus: { type: String, enum: ['chosen', 'in_mind', 'open', ''], default: '' },
  specificDestinations: [String],
  originLocation: String,
  destinationStyles: [String]
});

// Main TripPreferences schema
const tripPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupSize: String,
  duration: {
    type: mongoose.Schema.Types.Mixed, // Can be string or duration object
    default: ''
  },
  budget: {
    type: mongoose.Schema.Types.Mixed, // Can be string or number
    default: ''
  },
  currency: { type: String, default: 'USD' },
  budgetType: { type: String, enum: ['total', 'perDay', 'unsure'] },
  isNotSure: { type: Boolean, default: false },
  destinationApproach: destinationApproachSchema,
  destinationStyle: String,
  destinationStyles: [String],
  tripVibe: [String], // Array of trip vibes (max 3)
  planningStyle: {
    type: mongoose.Schema.Types.Mixed, // Can be string or number
    default: ''
  },
  planningType: String,
  leewayAmount: String,
  leewayExplanation: String,
  surpriseFromClaude: { type: Boolean, default: false },
  priorities: [String],
  vibeActivities: {
    type: Map,
    of: [String]
  },
  priorityOrder: [Number],
  // Add activities from Question 7
  activities: [String], // Activities from Question 7
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// Update lastModified on save
tripPreferencesSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('TripPreferences', tripPreferencesSchema);
