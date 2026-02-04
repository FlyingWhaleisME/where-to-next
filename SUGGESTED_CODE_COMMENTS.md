# Suggested Professional Comments for Code Screenshots

Add these comments to your code before taking screenshots. These are professional, computer science-focused comments that explain the logic.

---

## **TOOL 1: Database (MongoDB + Mongoose)**

## **TOOL 2: Third-Party Libraries**

### **File: `src/pages/BigIdeaPage.tsx` - Frontend Imports**

```typescript
// Import React library and hooks for component functionality
// React provides component-based UI architecture
import React, { useState, useEffect } from 'react';

// Import React Router for client-side navigation
// Enables page routing without full page reloads
import { useNavigate } from 'react-router-dom';

// Import Framer Motion for animations and transitions
// Provides smooth UI animations
import { motion, AnimatePresence } from 'framer-motion';

// Import custom components and services
import AIPromptDisplay from '../components/AIPromptDisplay';
import promptService from '../services/promptService';

// Import TypeScript type definitions for type safety
// Ensures data structures match expected format
import { TripPreferences, GeneratedPrompt } from '../types';

// Import custom React hook for reusable logic
import { useSurveyProgress } from '../hooks/useSurveyProgress';
```

---

### **File: `backend/server.js` - Backend Imports**

```javascript
// Import Express framework for HTTP server and API routing
// Express simplifies creating RESTful API endpoints
const express = require('express');

// Import CORS middleware for cross-origin resource sharing
// Allows frontend (different origin) to access backend API
const cors = require('cors');

// Import Mongoose library for MongoDB database operations
// Provides JavaScript interface for MongoDB (Object Document Mapper)
const mongoose = require('mongoose');

// Import JWT library for authentication token generation and verification
// Enables stateless user authentication
const jwt = require('jsonwebtoken');

// Import express-validator for input validation middleware
// Validates and sanitizes user input before processing
const { body, validationResult } = require('express-validator');

// Import OpenAI SDK for AI integration (optional feature)
const OpenAI = require('openai');

// Load environment variables from .env file
// Stores sensitive configuration (database URI, API keys)
require('dotenv').config();

// Create Express application instance
const app = express();
```

---

### **File: `backend/server.js` - Using Express Routes**

```javascript
// POST endpoint for user registration
// Array contains validation middleware functions
app.post('/api/auth/register', [
  // Validate email format using express-validator
  body('email').isEmail().withMessage('Please provide a valid email'),
  
  // Validate password meets minimum length requirement
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  
  // Optional name field with whitespace trimming
  body('name').optional().trim()
], async (req, res) => {
  // Check if validation passed
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  
  // Extract validated data from request body
  const { email, password, name } = req.body;
  
  // Query database to check if user already exists
  // Prevents duplicate account creation
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists with this email' });
  }
  
  // Create new User instance with hashed password
  const user = new User({ email, password, name });
  
  // Save user to MongoDB database
  await user.save();
  
  // Generate JWT authentication token
  // Token contains user ID and email, expires in 24 hours
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
  
  // Return success response with token and user data
  res.status(201).json({
    message: 'User created successfully',
    token,
    user: { id: user._id, email: user.email, name: user.name }
  });
});
```

---

## **TOOL 3: Event Handlers + Async/Await**

### **File: `src/services/collaborationService.ts` - WebSocket Events**

```typescript
// Create WebSocket connection to backend server
// wss:// indicates secure WebSocket protocol (like https://)
// Token included in URL query string for authentication
const wsUrl = `wss://where-to-next-backend.onrender.com?token=${encodeURIComponent(token)}`;
this.ws = new WebSocket(wsUrl);

// Event handler: Fires when WebSocket connection successfully opens
// Connection is now ready to send and receive messages
this.ws.onopen = () => {
  console.log('✅ WebSocket connection opened successfully');
  
  // Update service state to reflect connection status
  this.state.isConnected = true;
  this.state.lastError = null;
  this.reconnectAttempts = 0;
  
  // Notify other parts of application via callback
  this.callbacks.onConnectionChange?.(true);
  
  // Start heartbeat mechanism to keep connection alive
  this.startHeartbeat();
};

// Event handler: Fires when message received from server
// event.data contains the message as string
this.ws.onmessage = (event) => {
  // Parse JSON string to JavaScript object
  const message = JSON.parse(event.data);
  
  // Route message to appropriate handler based on type
  this.handleMessage(message);
};

// Event handler: Fires when WebSocket connection closes
// event.code indicates reason for closure
this.ws.onclose = (event) => {
  console.log('🔌 WebSocket connection closed');
  
  // Update state to reflect disconnection
  this.state.isConnected = false;
  this.callbacks.onConnectionChange?.(false);
  
  // Attempt automatic reconnection if connection was lost unexpectedly
  // Code 1000 indicates normal closure (no reconnect needed)
  if (event.code !== 1000 && token && hasActiveRoom) {
    this.attemptReconnect();
  }
};

// Event handler: Fires when WebSocket error occurs
// Handles network errors, connection failures, etc.
this.ws.onerror = (error) => {
  console.error('❌ WebSocket error occurred:', error);
  this.state.lastError = 'Connection error';
  this.callbacks.onError?.('Connection error');
};
```

---

### **File: `backend/collaborationServer.js` - Server Event Handlers**

```javascript
// Event handler: Fires when client sends message to server
// data parameter contains raw message data (buffer or string)
ws.on('message', (data) => {
  // Pass message to handler method for processing
  // Handler will parse JSON and route to appropriate function
  this.handleMessage(ws, data);
});

// Event handler: Fires when client closes WebSocket connection
// Clean up user session and room membership
ws.on('close', () => {
  // Remove user from active rooms and clean up session data
  this.handleDisconnection(ws);
});

// Event handler: Fires when WebSocket error occurs
// Prevents server crash on connection errors
ws.on('error', (error) => {
  console.error(`❌ WebSocket error for user ${ws.userName}:`, error);
  // Clean up on error to prevent memory leaks
  this.handleDisconnection(ws);
});
```

---

### **File: `backend/collaborationServer.js` - Async Database Operations**

```javascript
// Asynchronous function to handle user joining a chatroom
async handleJoinRoom(ws, message) {
  // ... room joining logic ...
  
  // Load chat history from database
  try {
    // Query MongoDB for chat messages in this room
    // await pauses execution until database query completes
    // ChatMessage.find() returns Promise that resolves with results
    const chatHistory = await ChatMessage.find({ roomId })
      .sort({ timestamp: 1 })    // Sort by timestamp ascending (oldest first)
      .limit(50);                 // Limit results to 50 most recent messages
    
    // Transform database documents to frontend format
    // Map function converts each document to required structure
    this.sendToClient(ws, {
      type: 'chat_history',
      messages: chatHistory.map(msg => ({
        id: msg._id,
        text: msg.message,
        user: { id: msg.userId, name: msg.userName },
        timestamp: msg.timestamp
      }))
    });
  } catch (error) {
    // Handle database query errors gracefully
    console.error('❌ Error loading chat history:', error);
  }
}
```

---

## **TOOL 4: React Framework**

### **File: `src/App.tsx` - React Router Setup**

```typescript
// Import React Router components for client-side navigation
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  // Component state for global chatbox visibility
  const [showGlobalChatbox, setShowGlobalChatbox] = useState(false);
  
  return (
    // BrowserRouter: Enables client-side routing
    // Allows navigation between pages without full page reloads
    <Router>
      {/* Routes: Defines URL paths and corresponding components */}
      <Routes>
        {/* Route: When URL path is "/", render HomePage component */}
        <Route path="/" element={<HomePage />} />
        
        {/* Route: When URL path is "/big-idea", render BigIdeaPage */}
        <Route path="/big-idea" element={<BigIdeaPage />} />
        
        {/* Protected Route: Requires user authentication */}
        {/* ProtectedRoute component checks authentication before rendering */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Route with dynamic parameter: :id can be any value */}
        {/* Example: /document/12345 or /document/abc */}
        <Route 
          path="/document/:id" 
          element={
            <ProtectedRoute>
              <DocumentEditingPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}
```

---

### **File: `src/pages/BigIdeaPage.tsx` - React Hooks**

```typescript
// Functional React component
// React.FC indicates this is a Function Component
const BigIdeaPage: React.FC = () => {
  // useState hook: Manages component state
  // Returns array: [currentValue, setterFunction]
  // currentQuestion tracks which survey question is displayed
  const [currentQuestion, setCurrentQuestion] = useState(1);
  
  // useState hook: Manages trip preferences object
  // Partial<TripPreferences> allows incomplete preference object
  const [tripPreferences, setTripPreferences] = useState<Partial<TripPreferences>>({});
  
  // useNavigate hook: Provides navigation function from React Router
  // Allows programmatic navigation to different pages
  const navigate = useNavigate();
  
  // useEffect hook: Executes code when component mounts or dependencies change
  // Empty dependency array [] means this runs only once when component mounts
  useEffect(() => {
    // Load saved preferences from localStorage
    const saved = getUserData('tripPreferences');
    if (saved) {
      // Update component state with saved data
      // Triggers re-render with loaded preferences
      setTripPreferences(saved);
    }
  }, []); // Empty array = run only on mount
  
  // useEffect hook: Runs when currentQuestion or totalQuestions changes
  // Updates progress bar to reflect current survey position
  useEffect(() => {
    updateProgress(currentQuestion, totalQuestions);
  }, [currentQuestion, totalQuestions, updateProgress]);
  
  // Render function: Returns JSX (JavaScript XML) - HTML-like syntax
  return (
    <div className="min-h-screen">
      {/* Conditional rendering: Show different question based on state */}
      {/* Only renders component if condition is true */}
      {currentQuestion === 1 && <Question1GroupSize />}
      {currentQuestion === 2 && <Question2Duration />}
      
      {/* Button with onClick event handler */}
      {/* Updates state, triggering re-render with next question */}
      <button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
        Next
      </button>
    </div>
  );
};
```

---

### **File: `src/components/bigIdea/Question1GroupSize.tsx` - Reusable Component (Tool 4, Section C)**

```typescript
// TypeScript interface defines component props structure
// Props allow parent component to pass data and callbacks to child
interface Question1GroupSizeProps {
  onAnswer: (questionNumber: number, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentQuestion: number;
  totalQuestions: number;
  canProceed: boolean;
}

// Functional component receives props via destructuring
// React.FC indicates this is a Function Component
const Question1GroupSize: React.FC<Question1GroupSizeProps> = ({
  onAnswer,
  onNext,
  onPrevious,
  currentQuestion,
  totalQuestions,
  canProceed
}) => {
  // useState hook manages selected group size state
  // Component re-renders when selectedGroupSize changes
  const [selectedGroupSize, setSelectedGroupSize] = useState<string>('');
  
  // useEffect hook runs once when component mounts
  // Loads previously saved answer from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('tripPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.groupSize) {
          setSelectedGroupSize(preferences.groupSize);
        }
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
      }
    }
  }, []);

  // Event handler function updates local state and notifies parent
  const handleSelect = (groupSize: string) => {
    setSelectedGroupSize(groupSize);
    // Call parent's callback function with question number and answer
    onAnswer(1, { groupSize });
  };

  return (
    <motion.div>
      <h2>How many people are going?</h2>
      {/* Map function renders list of options */}
      {/* Each option calls handleSelect when clicked */}
      {groupSizeOptions.map((option) => (
        <div key={option.value} onClick={() => handleSelect(option.value)}>
          {option.label}
        </div>
      ))}
    </motion.div>
  );
};
```

---

### **File: `src/pages/BigIdeaPage.tsx` - Using Reusable Component (Tool 4, Section C)**

```typescript
// Function that conditionally renders question components based on state
// Returns different component based on currentQuestion value
const renderQuestion = () => {
  // Common props object shared by all question components
  // Spread operator (...) passes all props to child component
  const commonProps = {
    onAnswer: handleAnswer,  // Parent function updates tripPreferences state
    onNext: handleNext,
    onPrevious: handlePrevious,
    currentQuestion,
    totalQuestions,
    canProceed: true
  };

  // Switch statement selects which component to render
  // Each case returns a different question component with same props
  switch (currentQuestion) {
    case 1:
      return <Question1GroupSize {...commonProps} />;
    case 2:
      return <Question2Duration {...commonProps} />;
    case 3:
      return <Question3Budget {...commonProps} />;
    default:
      return null;
  }
};

// In return statement:
return (
  <div>
    {/* Call renderQuestion function to display current question */}
    {renderQuestion()}
  </div>
);
```

---

### **File: `src/pages/BigIdeaPage.tsx` - Conditional Rendering (Tool 4, Section D)**

```typescript
// Function returns different component based on currentQuestion state
const renderQuestion = () => {
  const commonProps = {
    onAnswer: handleAnswer,
    onNext: handleNext,
    onPrevious: handlePrevious,
    currentQuestion,
    totalQuestions,
    canProceed: true
  };

  // Switch statement conditionally renders based on state value
  switch (currentQuestion) {
    case 1:
      return <Question1GroupSize {...commonProps} />;
    case 2:
      return <Question2Duration {...commonProps} />;
    case 3:
      return <Question3Budget {...commonProps} />;
    default:
      return null;
  }
};

return (
  <div>
    {/* Conditional rendering: function call returns component based on state */}
    {renderQuestion()}
    
    {/* Conditional rendering: only render if showSummary is true */}
    {showSummary && (
      <div>
        {/* Summary content */}
      </div>
    )}
    
    {/* Conditional rendering: both conditions must be true */}
    {showAIPrompt && aiPrompt && (
      <AIPromptDisplay
        prompt={aiPrompt}
        onClose={handlePromptClose}
      />
    )}
  </div>
);
```

---

### **File: `src/pages/ProfilePage.tsx` - State Management (Tool 4, Section E)**

```typescript
// Functional component with multiple state variables
const ProfilePage: React.FC = () => {
  // Multiple useState hooks manage different pieces of component state
  // Each hook returns [value, setterFunction] pair
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [tripPreferences, setTripPreferences] = useState<any>(null);
  const [savedTripPreferences, setSavedTripPreferences] = useState<any[]>([]);
  const [flightStrategies, setFlightStrategies] = useState<any[]>([]);
  const [expensePolicySets, setExpensePolicySets] = useState<any[]>([]);
  
  // useEffect hook loads data when component mounts
  // Empty dependency array [] means this runs only once
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!isAuthenticated() || !currentUser) {
      setDocuments([]);
      return;
    }

    // Load documents from localStorage (Tool 5: JSON parsing)
    const savedDocs = localStorage.getItem('destinationDocuments');
    if (savedDocs) {
      const allDocs = JSON.parse(savedDocs);
      // Filter array to show only current user's documents
      const userDocs = allDocs.filter((doc: DocumentData) => {
        return doc.creatorId === currentUser.id;
      });
      // Update state with filtered documents, triggers re-render
      setDocuments(userDocs);
    }

    // Load user-specific preferences (Tool 5: getUserData explained in Tool 5, case A)
    const savedPrefs = getUserData('tripPreferences');
    if (savedPrefs) {
      setTripPreferences(savedPrefs);
    }
  }, []);

  // Function updates state when document is deleted
  const handleDeleteDocument = (docId: string) => {
    // Update state: filter removes document from array
    // Component re-renders automatically with updated list
    setDocuments(documents.filter(doc => doc.id !== docId));
    
    // Also update localStorage (Tool 5: JSON operations)
    const savedDocs = localStorage.getItem('destinationDocuments');
    if (savedDocs) {
      const docs = JSON.parse(savedDocs);
      const updated = docs.filter(doc => doc.id !== docId);
      localStorage.setItem('destinationDocuments', JSON.stringify(updated));
    }
  };
  
  return (
    <div>
      {/* Map function renders list from state array */}
      {/* Each document in array becomes a div element */}
      {documents.map(doc => (
        <div key={doc.id}>
          <h3>{doc.destinationName}</h3>
          <button onClick={() => handleDeleteDocument(doc.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## **TOOL 5: JSON Key-Value Structure**

### **File: `src/utils/userDataStorage.ts` - JSON Operations**

```typescript
/**
 * Retrieve user-specific data from localStorage
 * Uses key-value structure: "tripPreferences_user123"
 * Generic type <T> allows function to return any data type
 */
export const getUserData = <T>(baseKey: string): T | null => {
  // Verify user is authenticated before accessing data
  if (!isAuthenticated()) {
    return null;
  }
  
  // Get current logged-in user
  const user = getCurrentUser();
  if (!user || !user.id) {
    return null;
  }
  
  // Create user-specific storage key
  // Format: "baseKey_userId" ensures data isolation per user
  const key = `${baseKey}_${user.id}`;
  
  // Retrieve JSON string from localStorage
  // localStorage only stores strings, not objects
  const data = localStorage.getItem(key);
  
  if (!data) {
    return null; // No data found for this user
  }
  
  try {
    // Parse JSON string to JavaScript object
    // JSON.parse() converts string representation to object with nested key-value pairs
    // Example: '{"groupSize":"pair"}' becomes {groupSize: "pair"}
    const parsed = JSON.parse(data) as T;
    return parsed;
  } catch (e) {
    // Handle JSON parsing errors (malformed JSON string)
    console.error(`Error parsing user data for key ${key}:`, e);
    return null;
  }
};

/**
 * Save user-specific data to localStorage
 * Converts JavaScript object to JSON string for storage
 */
export const setUserData = <T>(baseKey: string, data: T): void => {
  // Verify authentication before saving
  if (!isAuthenticated()) {
    throw new Error('Cannot save data without authentication');
  }
  
  const user = getCurrentUser();
  if (!user || !user.id) {
    throw new Error('Cannot save data without logged-in user');
  }
  
  // Create user-specific storage key
  const key = `${baseKey}_${user.id}`;
  
  // Convert JavaScript object to JSON string
  // JSON.stringify() serializes object with nested key-value pairs to string
  // Example: {groupSize: "pair"} becomes '{"groupSize":"pair"}'
  // Necessary because localStorage only stores strings
  localStorage.setItem(key, JSON.stringify(data));
};
```

---

### **File: `src/pages/DocumentEditingPage.tsx` - Complex Nested Objects**

```typescript
const handleSaveDocument = () => {
  // Retrieve existing documents from localStorage
  const savedDocs = localStorage.getItem('destinationDocuments');
  
  // Parse JSON string to JavaScript array
  // If no documents exist, initialize empty array
  let docs: DocumentData[] = savedDocs ? JSON.parse(savedDocs) : [];
  
  // Create document object with nested key-value structure
  const updatedDocument: DocumentData = {
    // Top-level key-value pairs
    id: document.id,                      // Key: "id", Value: string
    destinationName: documentName,        // Key: "destinationName", Value: string
    creatorId: currentUser.id,           // Key: "creatorId", Value: string
    
    // Nested object: calendar planner
    // Contains sub-key-value pairs
    calendarPlanner: {
      duration: document.calendarPlanner?.duration || '',  // Nested key-value
      dates: document.calendarPlanner?.dates || [],        // Nested array
      timeSlots: document.calendarPlanner?.timeSlots || []  // Nested array of objects
    },
    
    // Nested object: survey data
    bigIdeaSurveyData: {
      groupSize: tripPreferences?.groupSize,    // Nested key-value
      budget: tripPreferences?.budget,          // Nested key-value
      destinationStyle: tripPreferences?.destinationStyle, // Nested array
    },
    
    // Deeply nested object: editable fields
    editableFields: {
      dates: {                                 // Object within nested object
        startDate: document.editableFields?.dates?.startDate || '',
        endDate: document.editableFields?.dates?.endDate || ''
      },
      budget: {
        amount: document.editableFields?.budget?.amount || 0,
        currency: document.editableFields?.budget?.currency || 'USD'
      }
    }
  };
  
  // Update existing document or add new one to array
  const existingIndex = docs.findIndex(doc => doc.id === document.id);
  if (existingIndex >= 0) {
    docs[existingIndex] = updatedDocument; // Update existing
  } else {
    docs.push(updatedDocument);            // Add new
  }
  
  // Convert array of objects to JSON string and save to localStorage
  // JSON.stringify() handles nested structures automatically
  localStorage.setItem('destinationDocuments', JSON.stringify(docs));
};
```

---

## **HOW TO USE THESE COMMENTS**

1. **Copy the relevant comment block** for the code section you're screenshotting
2. **Replace existing comments** in your code (especially AI-style comments)
3. **Keep the code structure** - only modify comments
4. **Take screenshot** with line numbers visible
5. **Remove comments** after screenshot if you prefer (or keep them for documentation)

---

## **REMEMBER**

- ✅ Comments explain **what** the code does and **why**
- ✅ Use computer science terminology appropriately
- ✅ Keep comments concise but informative
- ✅ Remove emoji and casual language
- ✅ Focus on technical explanation, not implementation details

