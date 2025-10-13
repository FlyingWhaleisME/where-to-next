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

// Main Document schema
const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destinationName: {
    type: String,
    required: true,
    trim: true
  },
  surveyData: {
    type: mongoose.Schema.Types.Mixed // Legacy support
  },
  bigIdeaSurveyData: {
    type: mongoose.Schema.Types.Mixed
  },
  tripTracingSurveyData: {
    type: mongoose.Schema.Types.Mixed
  },
  isAutoCreated: { type: Boolean, default: false },
  surveyOrigin: surveyOriginSchema,
  calendarPlanner: calendarPlannerSchema,
  optionsOrganizer: optionsOrganizerSchema,
  editableFields: editableFieldsSchema,
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
documentSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Document', documentSchema);
