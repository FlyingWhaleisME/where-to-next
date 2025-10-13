const mongoose = require('mongoose');

// Trip Tracing State schema (matches frontend TripTracingState interface exactly)
const tripTracingStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Survey metadata
  surveyId: String,
  surveyName: String,
  surveyDate: String,
  groupSize: String, // From Big Idea survey
  isSoloTraveler: Boolean, // Computed from groupSize
  sectionsCompleted: [String], // Track which sections were completed
  
  accommodation: {
    selectedTypes: [String],
    changeThroughTrip: Boolean,
    changeType: Boolean
  },
  
  travelMethod: {
    travelMethod: { type: String, enum: ['flights', 'driving', 'public_transport', 'undecided'] },
    publicTransportType: { type: String, enum: ['train', 'bus', 'ferry', 'cruise', 'other'] },
    publicTransportDetails: String
  },
  
  transportation: {
    selectedMethods: [String],
    changeThroughTrip: Boolean,
    changeType: Boolean
  },
  
  mealPatterns: {
    selectedMeals: [String],
    changeThroughTrip: Boolean,
    changeType: Boolean
  },
  
  flight: {
    priority: { type: String, enum: ['time', 'cost', 'costEffectiveness'] },
    flightType: { type: String, enum: ['direct', 'connecting', 'undecided'] },
    explanation: String,
    strategyChoice: { type: String, enum: ['provide', 'get_ai'] },
    customStrategy: String,
    selectedSavedStrategy: String
  },
  
  expenses: {
    type: String,
    explanation: String,
    customPolicies: [String],
    selectedSavedPolicySet: String
  },
  
  foodPreferences: {
    styles: [String], // local, international, street, fine, casual, dontMind
    popularity: Boolean,
    vegan: Boolean,
    goodPicVibe: Boolean
  },
  
  activities: {
    interests: [String],
    changeThroughTrip: Boolean,
    changeType: Boolean
  },
  
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
tripTracingStateSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('TripTracingState', tripTracingStateSchema);
