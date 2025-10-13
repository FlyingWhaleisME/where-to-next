// Trip Preferences from Big Picture Survey
export interface TripPreferences {
  groupSize?: string;
  duration?: string | {
    range?: {
      status: 'decided' | 'in_mind' | 'undecided' | '';
      startMonth: string;
      startYear: string;
      startDay: string;
      endMonth: string;
      endYear: string;
      endDay: string;
    };
    duration?: {
      status: 'decided' | 'in_mind' | 'undecided' | '';
      days: string;
      weeks: string;
      months: string;
      minDays: string;
      minWeeks: string;
      minMonths: string;
      maxDays: string;
      maxWeeks: string;
      maxMonths: string;
    };
    dates?: {
      status: 'decided' | 'undecided' | '';
      startDate: string;
      endDate: string;
    };
  };
  budget?: string | number;
  currency?: string; // Currency code (USD, EUR, etc.)
  budgetType?: 'total' | 'perDay'; // Budget type from Question3
  isNotSure?: boolean; // For budget question "not sure" option
  destinationApproach?: {
    travelType: 'abroad' | 'domestic' | '';
    destinationStatus: 'chosen' | 'in_mind' | 'open' | '';
    specificDestinations?: string[];
    originLocation?: string;
    destinationStyles?: string[]; // For "in_mind" status
  };
  destinationStyle?: string;
  destinationStyles?: string[];
  tripVibe?: string;
  planningStyle?: string | number;
  planningType?: string; // Added for Question7PlanningStyle component
  leewayAmount?: string; // For planning style ≤25%
  leewayExplanation?: string; // For planning style <50%
  surpriseFromClaude?: boolean;
  priorities?: string[];
  vibeActivities?: {[key: string]: string[]}; // Activities from Question 7
  priorityOrder?: number[];
}

// Destination Information
export interface Destination {
  id: string;
  name: string;
  location: string;
  matchPercentage: number;
  highlights: string[];
  uniqueFeature: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  crowdedness: 'low' | 'medium' | 'high';
  surroundingPlaces: string[];
  accommodationStyles: string[];
  visaRequirements: string;
  travelTips: string[];
  basicEtiquettes: string[];
  simpleLanguage: string[];
  budgetRanges: {
    tight: { range: string; reason: string; citation: string };
    enough: { range: string; reason: string; citation: string };
    luxurious: { range: string; reason: string; citation: string };
  };
}

// Trip Tracing State
export interface TripTracingState {
  // Survey metadata
  surveyId?: string;
  surveyName?: string;
  surveyDate?: string;
  groupSize?: string; // From Big Idea survey
  isSoloTraveler?: boolean; // Computed from groupSize
  sectionsCompleted?: string[]; // Track which sections were completed
  
  accommodation: {
    selectedTypes: string[];
    changeThroughTrip: boolean;
    changeType: boolean;
  };
  travelMethod: {
    travelMethod: 'flights' | 'driving' | 'public_transport' | 'undecided';
    publicTransportType?: 'train' | 'bus' | 'ferry' | 'cruise' | 'other';
    publicTransportDetails?: string;
  };
  transportation: {
    selectedMethods: string[];
    changeThroughTrip: boolean;
    changeType: boolean;
  };
  mealPatterns: {
    selectedMeals: string[];
    changeThroughTrip: boolean;
    changeType: boolean;
  };
  flight: {
    priority: 'time' | 'cost' | 'costEffectiveness';
    flightType: 'direct' | 'connecting' | 'undecided';
    explanation: string;
    strategyChoice?: 'provide' | 'get_ai';
    customStrategy?: string;
    selectedSavedStrategy?: string;
  };
  expenses: {
    type: string;
    explanation: string;
    customPolicies?: string[];
    selectedSavedPolicySet?: string;
  };
  foodPreferences: {
    styles: ('local' | 'international' | 'street' | 'fine' | 'casual' | 'dontMind')[];
    popularity: boolean;
    vegan: boolean;
    goodPicVibe: boolean;
  };
  activities: {
    interests: string[];
    explanation: string;
  };
}

// Saved Trip Tracing Survey
export interface SavedTripTracingSurvey {
  id: string;
  name: string;
  surveyData: TripTracingState;
  createdAt: string;
  lastModified: string;
}

// Generated Cards
export interface GeneratedCard {
  id: string;
  name: string;
  type: 'accommodation' | 'meal' | 'activity';
  priceRange: string;
  matchRate: number;
  openTime?: string;
  website?: string;
  description: string;
}

// Complete Itinerary
export interface CompleteItinerary {
  date: string;
  duration: string;
  destination: string;
  colloquialComment: string;
  companions: string;
  budgetPerPerson: number;
  accommodation: string;
  tripType: string;
  pace: string;
  dailySchedule: {
    time: string;
    activity: string;
    description: string;
  }[];
  visaRequirements: string;
  travelTips: string[];
  basicEtiquettes: string[];
  simpleLanguage: string[];
}

// AI Prompt System
export interface PromptRequest {
  type: 'big-picture' | 'destinations' | 'trip-tracing' | 'final-itinerary';
  tripPreferences: TripPreferences;
  tripTracingState?: TripTracingState;
  destinationCount?: number;
}

export interface GeneratedPrompt {
  title: string;
  description: string;
  tips: string[];
  prompt?: string; // Legacy support
  preferencesPrompt?: string; // New: for preferences
  destinationPrompt?: string; // New: for destination-specific info
  links: string[];
}

// Document System
export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  duration: string;
  activity: string;
  description: string;
  type: 'accommodation' | 'meal' | 'activity'; // Add type field for color coding
}

export interface DocumentData {
  id: string;
  destinationName: string;
  surveyData?: any; // Legacy support
  bigIdeaSurveyData?: TripPreferences; // Big Idea survey results
  tripTracingSurveyData?: TripTracingState; // Trip Tracing survey results
  isAutoCreated?: boolean; // Flag for auto-created documents
  surveyOrigin?: {
    bigIdeaSurveyId?: string; // ID of the Big Idea survey that created this
    bigIdeaSurveyName?: string; // User-friendly name for the survey
    bigIdeaSurveyDate?: string; // When the Big Idea survey was completed
    tripTracingSurveyId?: string; // ID of the Trip Tracing survey
    tripTracingSurveyDate?: string; // When Trip Tracing was completed
  };
  calendarPlanner: {
    duration: string;
    startDate?: string;
    endDate?: string;
    dates: string[];
    timeSlots: TimeSlot[];
  };
  optionsOrganizer: {
    accommodation: string[];
    meals: string[];
    activities: string[];
  };
  // User-editable fields for AI discussion documentation
  editableFields?: {
    dates?: {
      startDate?: string;              // User-editable start date
      endDate?: string;                // User-editable end date
      duration?: string;               // User-editable duration description
    };
    budget?: {
      amount?: number;                 // Budget amount
      perDay?: boolean;               // true = per day, false = total
      currency?: string;              // Currency (default USD)
      notes?: string;                 // Budget notes/explanation
    };
    transportation?: {
      toDestination?: string;         // Transportation to destination
      withinDestination?: string;     // Local transportation within destination
      toNotes?: string;               // Notes for transportation to destination
      withinNotes?: string;           // Notes for transportation within destination
    };
    expenseSharing?: {
      policy?: string;                // Expense sharing policy for group travel
      customPolicies?: string[];      // Custom expense policies when policy is 'custom'
    };
    groupMembers?: string[];          // Names of group members
    groupRules?: {
      rules?: string[];               // Group rules as array of strings
    };
    travelerName?: string;            // Name of solo traveler for Travel Handbook
  };
  createdAt: string;
  lastModified: string;
}

// Collaborative Contract
export interface ContractChange {
  id: string;
  field: keyof CollaborativeContract;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  rejectedBy?: string;
}

export interface CollaborativeContract {
  title: string;
  parties: string[];
  keyTerms: string;
  travelGoals: string;
  importantNotes: string;
  lastModified: string;
  lastModifiedBy: string;
  pendingChanges: ContractChange[];
  approvalHistory: ContractChange[];
}

// Shared Document
export interface SharedDocument {
  id: string;
  documentData: DocumentData;
  contract?: CollaborativeContract;
  sharedAt: string;
  sharedBy: string;
} 