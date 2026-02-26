const mongoose = require('mongoose');

// Time slot sub-schema
const timeSlotSchema = new mongoose.Schema({
  id: String,
  date: String,
  startTime: String,
  duration: String,
  activity: String,
  description: String
});

// Calendar planner sub-schema
const calendarPlannerSchema = new mongoose.Schema({
  duration: String,
  startDate: String,
  endDate: String,
  dates: [String],
  timeSlots: [timeSlotSchema]
});

// Options organizer sub-schema
const optionsOrganizerSchema = new mongoose.Schema({
  accommodation: [String],
  meals: [String],
  activities: [String]
});

// Editable fields sub-schema
const editableFieldsSchema = new mongoose.Schema({
  dates: {
    startDate: String,
    endDate: String,
    duration: String
  },
  budget: {
    amount: Number,
    perDay: Boolean,
    currency: String,
    notes: String
  },
  transportation: {
    toDestination: String,
    withinDestination: String,
    toNotes: String,
    withinNotes: String
  },
  expenseSharing: {
    policy: String,
    customPolicies: [String]
  },
  groupMembers: [String],
  groupRules: {
    rules: [String]
  },
  travelerName: String
});

// Survey origin sub-schema
const surveyOriginSchema = new mongoose.Schema({
  bigIdeaSurveyId: String,
  bigIdeaSurveyName: String,
  bigIdeaSurveyDate: String,
  tripTracingSurveyId: String,
  tripTracingSurveyDate: String
});

// MongoDB schema for trip documents that enforces data structure and validation rules
const documentSchema = new mongoose.Schema({
  // Reference to User collection - links document to creator
  userId: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId data type
    ref: 'User', // Reference to User model
    required: true // Field is mandatory
  },

  // Destination name string field with validation
  destinationName: {
    type: String,
    required: true, // Must be provided
    trim: true// Remove leading/trailing whitespace
  },

  // Below are flexible nested data structures for survey responses
  surveyData: { // Legacy support
    type: mongoose.Schema.Types.Mixed
  },
  // Nested key-value structures for big idea survey results stored as flexible JSON object
  bigIdeaSurveyData: { 
    type: mongoose.Schema.Types.Mixed
  },
  // Nested key-value structures for trip tracing survey results stored as flexible JSON object
  tripTracingSurveyData: { 
    type: mongoose.Schema.Types.Mixed
  },
  isAutoCreated: { type: Boolean, default: false }, // Flag for auto-created documents
  
  // Below are nested schemas for other data structures
  surveyOrigin: surveyOriginSchema, // Survey origin data
  calendarPlanner: calendarPlannerSchema, // Calendar planner data
  optionsOrganizer: optionsOrganizerSchema, // Options organizer data
  editableFields: editableFieldsSchema, // Editable fields data

  // Automatic timestamp management
  createdAt: {
    type: Date,
    default: Date.now // Set to current time on creation
  },
  lastModified: {
    type: Date,
    default: Date.now // Updated on each save operation
  }
});

// Function of documentSchema for Mongoose middleware to be executed before document save operation
documentSchema.pre('save', function(next) {
  this.lastModified = new Date(); // Update timestamp
  next(); // Continue with save operation
});

// Export Mongoose model for use in other files
// 'Document' is the model name, documentSchema defines the structure
module.exports = mongoose.model('Document', documentSchema);
