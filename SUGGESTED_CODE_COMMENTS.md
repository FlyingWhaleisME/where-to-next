# Suggested Professional Comments for Code Screenshots

Add these comments to your code before taking screenshots. These are professional, computer science-focused comments that explain the logic.

---

## **TOOL 1: Database (MongoDB + Mongoose)**

## **TOOL 2: Third-Party Libraries**

## **TOOL 3: Event Handlers + Async/Await**

## **TOOL 4: React Framework**

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

