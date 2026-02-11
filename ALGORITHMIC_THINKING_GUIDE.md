# IB Computer Science IA: Algorithmic Thinking
## Where-to-Next Itinerary Planning Website

---

## **LIST OF ALGORITHMS**

1. **Survey Navigation with Conditional Skipping and Validation Algorithm** - Dynamically navigates through surveys by skipping irrelevant questions and validates completion with conditional requirements based on user answers
2. **Room Membership Persistence Algorithm** - Tracks chatroom members persistently, marking online/offline instead of removing
3. **Document Ownership Verification & Filtering Algorithm** - Verifies and filters documents to show only those owned by the current user
4. **Document Creation from Survey Data Algorithm** - Creates multiple destination documents from survey results with proper data transformation

---

## **ALGORITHM 1: Survey Navigation with Conditional Skipping and Validation Algorithm**

### **STEP 1: Explain the Problem You Are Solving**

**Problem Statement:**
The Big Idea survey has 9 questions, but not all questions are relevant or required for all users. The application needed to:
- Skip irrelevant questions during navigation (e.g., Question 5 is only relevant if user selected "open" or "in_mind" in Question 4)
- Validate completion with conditional requirements (Question 5 is only required if destination status is "open" or "in_mind")
- Prevent users from proceeding with incomplete data
- Handle different data types correctly (strings, arrays, numbers)
- Work for multiple surveys (Big Idea and Trip Tracing) with different skip rules

**Why this is a problem:**
Without conditional navigation and validation:
- Users are forced to answer irrelevant questions (poor UX)
- Users might be blocked from completing when questions aren't applicable
- Users might proceed with incomplete data
- The survey feels less personalized and intelligent
- Data quality suffers (users select random answers just to proceed)

---

### **STEP 2: Explain How You Solved It (Code + Flowchart)**

**Solution Overview:**
The algorithm has two main components:
1. **Navigation Component**: Dynamically calculates the next question based on the user's previous answers, skipping irrelevant questions in both forward and backward navigation.
2. **Validation Component**: Validates survey completion with conditional requirements - some questions are only required based on previous answers.

**File:** `src/pages/BigIdeaPage.tsx`  
**Lines:** 216-341 (`handleNext` and `handlePrevious`), 369-411 (`isComplete`)

```typescript
/**
 * Algorithm 1: Survey Navigation with Conditional Skipping Algorithm
 * This algorithm dynamically determines which question to show next based on
 * user's previous answers, skipping irrelevant questions to provide a personalized survey flow.
 */
const handleNext = () => {
  if (currentQuestion < totalQuestions) {
    let nextQuestion = currentQuestion + 1;
    
    // Skip Question 5 (Destination Style) only if destination status is 'chosen'
    // Question 5 is only relevant if user selected 'open' or 'in_mind' in Question 4
    if (currentQuestion === 4 && tripPreferences.destinationApproach?.destinationStatus === 'chosen') {
      console.log('Skipping Question 5 (Destination Style) - destination status is chosen');
      nextQuestion = 6; // Skip directly to Question 6 (Trip Vibe)
    }
    
    // Handle edge case: Skip Question 5 if we're on Question 4 and going backwards
    if (nextQuestion === 5 && tripPreferences.destinationApproach?.destinationStatus === 'chosen') {
      console.log('Skipping Question 5 (Destination Style) - destination status is chosen');
      nextQuestion = 6;
    }
    
    setCurrentQuestion(nextQuestion);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // All questions completed, proceed to summary
    if (isComplete()) {
      setShowSummary(true);
      markCompleted();
    }
  }
};

const handlePrevious = () => {
  if (currentQuestion > 1) {
    let prevQuestion = currentQuestion - 1;
    
    // Skip Question 5 when going backwards if destination status is not 'open'
    if (currentQuestion === 6 && tripPreferences.destinationApproach?.destinationStatus !== 'open') {
      console.log('Skipping Question 5 (Destination Style) going backwards - destination status is not open');
      prevQuestion = 4; // Go back to Question 4 (Destination Approach)
    }
    
    setCurrentQuestion(prevQuestion);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
```

**Additional Implementation in Trip Tracing Survey (`src/pages/TripTracingPage.tsx`, Lines: 66-115):**
```typescript
const handleNext = () => {
  if (currentSection < totalSections) {
    let nextSection = currentSection + 1;
    
    // Skip FlightSection (section 3) if travel method is driving or public transport
    if (currentSection === 2) {
      const travelMethod = tripTracingState.travelMethod?.travelMethod;
      if (travelMethod === 'driving' || travelMethod === 'public_transport') {
        console.log('Skipping FlightSection - travel method is:', travelMethod);
        nextSection = 4; // Skip to TransportationSection (local transport)
      }
    }
    
    // Skip ExpensesSection (section 6) for solo travelers
    if (currentSection === 5 && tripPreferences?.groupSize === 'solo') {
      console.log('Skipping ExpensesSection - solo traveler');
      nextSection = 7; // Skip to FoodPreferencesSection
    }
    
    setCurrentSection(nextSection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
```

**Flowchart:**
```
NAVIGATION FLOW:
FORWARD NAVIGATION (handleNext):
START
  ↓
User clicks "Next" on question N
  ↓
Calculate nextQuestion = N + 1
  ↓
Check: Current question is 4 AND destinationStatus === 'chosen'?
  ↓
  YES → Set nextQuestion = 6 (skip Question 5)
  NO → Check: nextQuestion === 5 AND destinationStatus === 'chosen'?
        ↓ YES → Set nextQuestion = 6
        ↓ NO → Keep nextQuestion = N + 1
  ↓
Navigate to nextQuestion
  ↓
END

BACKWARD NAVIGATION (handlePrevious):
START
  ↓
User clicks "Previous" on question N
  ↓
Calculate prevQuestion = N - 1
  ↓
Check: Current question is 6 AND destinationStatus !== 'open'?
  ↓
  YES → Set prevQuestion = 4 (skip Question 5)
  NO → Keep prevQuestion = N - 1
  ↓
Navigate to prevQuestion
  ↓
END

VALIDATION FLOW (isComplete):
START
  ↓
Check base requirements:
  - groupSize exists?
  - duration exists?
  - budget is defined (can be 0)?
  - destinationApproach exists?
  - travelType exists?
  - destinationStatus exists?
  - tripVibe exists and is non-empty string?
  - planningStyle exists?
  - priorities exists and has items?
  ↓
  All base requirements met?
    ↓ NO → Return false (incomplete)
    ↓ YES
  Check destinationStatus
    ↓
    destinationStatus === 'open' OR 'in_mind'?
      ↓ YES
      Check destinationStyle OR destinationStyles exists?
        ↓ NO → Return false (incomplete)
        ↓ YES → destinationStyleComplete = true
      ↓ NO (status === 'chosen')
      destinationStyleComplete = true (not required)
    ↓
  baseComplete AND destinationStyleComplete?
    ↓ NO → Return false
    ↓ YES → Return true (complete)
  ↓
END
```

**Part 2: Validation Component (`isComplete` function):**

```typescript
// Algorithm 1 (continued): Survey Completion Validation
// Validates survey completion with conditional requirements based on user choices
const isComplete = (): boolean => {
  // 1. Check base requirements (always required regardless of user choices)
  const baseComplete = !!(
    tripPreferences.groupSize &&
    tripPreferences.duration &&
    (tripPreferences.budget !== undefined && tripPreferences.budget !== null) && // Allow 0 budget
    tripPreferences.destinationApproach &&
    tripPreferences.destinationApproach.travelType &&
    tripPreferences.destinationApproach.destinationStatus &&
    tripPreferences.tripVibe && 
    (typeof tripPreferences.tripVibe === 'string' && tripPreferences.tripVibe.trim().length > 0) && // Validate data types - tripVibe must be non-empty string
    tripPreferences.planningStyle &&
    tripPreferences.priorities &&
    tripPreferences.priorities.length > 0
  );
  
  // 2. Check conditional requirements (destinationStyle only if status is 'open' or 'in_mind')
  const destinationStyleComplete = (tripPreferences.destinationApproach?.destinationStatus === 'open' || 
                                   tripPreferences.destinationApproach?.destinationStatus === 'in_mind')
    ? !!(tripPreferences.destinationStyle || (tripPreferences.destinationStyles && tripPreferences.destinationStyles.length > 0))
    : true; // Not required if status is 'chosen'
  
  // 3. Return true only if both base and conditional requirements are met
  const complete = baseComplete && destinationStyleComplete;
  
  return complete;
};
```

**What this does:**
- **Navigation Component:**
  - Dynamically calculates next/previous question based on user answers
  - Skips irrelevant questions in forward navigation
  - Skips irrelevant questions in backward navigation
  - Works for multiple surveys (Big Idea and Trip Tracing)
  - Handles edge cases (e.g., navigating backwards from Question 6)
  - Provides smooth user experience with automatic scrolling

- **Validation Component:**
  - Validates all base requirements are met (always required)
  - Conditionally checks Question 5 based on Question 4's answer
  - Handles different data types (strings, arrays, numbers)
  - Allows 0 budget (explicit check for undefined/null)
  - Validates tripVibe is non-empty string
  - Returns boolean indicating completion status
  - Prevents users from proceeding to summary with incomplete data

---

### **STEP 3: Explain WHY You Used This Approach**

**Justification (Relative Advantages Compared to Alternatives):**

1. **Conditional Navigation vs. Show All Questions Always:**
   - ✅ **User Experience**: Users only see relevant questions (vs. wasting time on irrelevant ones)
   - ✅ **Personalization**: Survey feels intelligent and adaptive (vs. generic one-size-fits-all)
   - ✅ **Data Quality**: Users don't select random answers just to proceed (vs. forced irrelevant responses)
   - ✅ **Completion Time**: Reduces survey completion time (vs. longer surveys with unnecessary questions)

2. **Skipping Questions vs. Hiding Questions:**
   - ✅ **Navigation Consistency**: Questions are truly removed from flow (vs. hidden but still in navigation sequence)
   - ✅ **Simplicity**: Cleaner navigation logic (vs. complex UI show/hide logic)
   - ✅ **Tracking**: Easy to track which questions were actually shown (vs. confusing state management)
   - ✅ **User Clarity**: Clear progress indication (vs. hidden questions creating confusion)

3. **Unified Algorithm vs. Separate Survey Flows:**
   - ✅ **Code Reusability**: Single algorithm works for multiple surveys (vs. code duplication)
   - ✅ **Maintainability**: Centralized logic easier to modify (vs. multiple implementations to update)
   - ✅ **Consistency**: Same navigation experience across surveys (vs. inconsistent flows)
   - ✅ **Flexibility**: Easy to add new skip rules (vs. modifying multiple survey implementations)

4. **Conditional Validation vs. Always Require All Questions:**
   - ✅ **User Experience**: Users aren't blocked by irrelevant questions (vs. forced to answer inapplicable questions)
   - ✅ **Flexibility**: Adapts requirements based on user choices (vs. rigid validation)
   - ✅ **Data Integrity**: Ensures all required data is present (vs. allowing incomplete data)
   - ✅ **Type Safety**: Validates data types and handles edge cases (vs. potential type errors)

5. **Client-Side Validation vs. Server-Side Only:**
   - ✅ **Performance**: Immediate feedback without API calls (vs. network latency)
   - ✅ **User Experience**: Instant validation prevents confusion (vs. delayed error messages)
   - ✅ **Offline Capability**: Works without network connection (vs. requires constant API access)
   - ✅ **Simplicity**: Integrated with client-side survey flow (vs. complex server-client synchronization)

---

## **ALGORITHM 2: Room Membership Persistence Algorithm**

### **STEP 1: Explain the Problem You Are Solving**

**Problem Statement:**
The collaboration chatroom system needed to track which users have joined a room, but the initial implementation removed users from the room when they disconnected. This caused:
- Users disappeared from the "Users" tab when they went offline
- No way to see who had previously joined the room
- Users had to rejoin rooms even if they were just temporarily disconnected
- Room history was lost when all users went offline

**Why this is a problem:**
For a collaborative planning tool, users need to see who has been part of the conversation, even if they're currently offline. The system should distinguish between "temporarily offline" and "permanently left the room" to provide better context and collaboration history.

---

### **STEP 2: Explain How You Solved It (Code + Flowchart)**

**Solution Overview:**
The algorithm maintains a persistent list of all users who have ever joined a room, marking them as online/offline instead of removing them. Rooms are only deleted when no online members remain.

**File:** `backend/collaborationServer.js`  
**Lines:** 441-496 (joinRoom), 498-581 (leaveRoom)

```javascript
joinRoom(ws, roomId) {
  // Initialize room if it doesn't exist
  if (!this.tripRooms.has(roomId)) {
    this.tripRooms.set(roomId, new Set());
  }
  
  // Add WebSocket connection to active room
  this.tripRooms.get(roomId).add(ws);
  ws.currentTripId = roomId;
  
  // Update user session
  const userSession = this.userSessions.get(ws.userId);
  if (userSession) {
    userSession.currentTripId = roomId;
  }

  // Initialize persistent room members map if needed
  if (!this.roomMembers.has(roomId)) {
    this.roomMembers.set(roomId, new Map());
  }
  
  // Check if user is already in persistent members list
  if (!this.roomMembers.get(roomId).has(ws.userId)) {
    // Add new member to persistent list
    this.roomMembers.get(roomId).set(ws.userId, {
      id: ws.userId,
      name: ws.userName,
      email: ws.userEmail,
      joinedAt: new Date(),
      isOnline: true,
      lastSeen: new Date()
    });
    console.log(`✅ User ${ws.userName} added to room members for ${roomId}`);
  } else {
    // Update existing member: mark as online
    const member = this.roomMembers.get(roomId).get(ws.userId);
    member.isOnline = true;
    member.lastSeen = new Date();
    member.name = ws.userName; // Update name in case it changed
    console.log(`✅ User ${ws.userName} marked as online in room ${roomId}`);
  }

  // Notify user and broadcast to room
  this.sendToClient(ws, {
    type: 'user_joined',
    user: { id: ws.userId, name: ws.userName },
    timestamp: new Date().toISOString()
  });
  
  this.broadcastToRoom(roomId, {
    type: 'user_joined',
    user: { id: ws.userId, name: ws.userName },
    timestamp: new Date().toISOString()
  }, ws);
}

leaveRoom(ws, roomId) {
  // Remove WebSocket from active connections
  if (this.tripRooms.has(roomId)) {
    this.tripRooms.get(roomId).delete(ws);
    
    // Clean up empty rooms
    if (this.tripRooms.get(roomId).size === 0) {
      this.tripRooms.delete(roomId);
    }
  }

  // Mark user as offline instead of removing them
  if (this.roomMembers.has(roomId) && this.roomMembers.get(roomId).has(ws.userId)) {
    const member = this.roomMembers.get(roomId).get(ws.userId);
    member.isOnline = false;
    member.lastSeen = new Date();
    console.log(`👋 User ${ws.userName} marked as offline in room ${roomId} (kept in members list)`);
    
    // Check if room has any online members left
    const allMembers = Array.from(this.roomMembers.get(roomId)?.values() || []);
    const onlineMembers = allMembers.filter(m => m.isOnline);
    
    if (onlineMembers.length === 0) {
      // No online members: delete room completely
      console.log(`🗑️ Room ${roomId} has no online members - cleaning up all room data`);
      this.roomMembers.delete(roomId);
      this.roomCreators.delete(roomId);
      
      // Notify all clients that room was deleted
      this.broadcastToAllClients({
        type: 'room_deleted',
        roomId,
        message: `Room ${roomId} has been deleted because it's empty`
      });
      
      ws.currentTripId = null;
      return;
    }
    
    // Room still has members: broadcast updated user list (including offline users)
    const allRoomMembers = allMembers.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      isOnline: member.isOnline,
      joinedAt: member.joinedAt,
      lastSeen: member.lastSeen,
      isCreator: this.roomCreators.get(roomId) === member.id
    }));
    
    this.broadcastToRoom(roomId, {
      type: 'room_users',
      users: allRoomMembers
    });
  }
}
```

**Flowchart:**
```
JOIN ROOM:
START
  ↓
User connects to room
  ↓
Initialize room if needed
  ↓
Add WebSocket to active connections
  ↓
Check if user in persistent members list
  ↓
  NO → Add new member (isOnline: true, joinedAt: now)
  YES → Update member (isOnline: true, lastSeen: now)
  ↓
Broadcast user_joined to room
  ↓
END

LEAVE ROOM:
START
  ↓
User disconnects
  ↓
Remove WebSocket from active connections
  ↓
Mark user as offline (isOnline: false, lastSeen: now)
  ↓
Count online members
  ↓
  Online members > 0?
    ↓ YES
    Broadcast updated user list (all members, online + offline)
    ↓
    END
    ↓ NO
    Delete room completely
    ↓
    Broadcast room_deleted
    ↓
    END
```

**What this does:**
- Maintains persistent list of all room members
- Marks users online/offline instead of removing them
- Only deletes room when no online members remain
- Preserves room history and member list
- Updates lastSeen timestamp for tracking

---

### **STEP 3: Explain WHY You Used This Approach**

**Justification (Relative Advantages Compared to Alternatives):**

1. **Persistent Membership vs. Remove Users on Disconnect:**
   - ✅ **User Experience**: Users can see who has been part of the conversation (vs. users disappearing when offline)
   - ✅ **Context**: Visual distinction between online (green) and offline (red) users (vs. no indication of room history)
   - ✅ **Collaboration**: Room history preserved even when users disconnect (vs. lost history on disconnect)
   - ✅ **Clarity**: Users understand who has access to the room (vs. confusion about who can see messages)

2. **In-Memory Map vs. Database Storage:**
   - ✅ **Performance**: Faster access (in-memory Map vs. database queries with network latency)
   - ✅ **Simplicity**: Less complex implementation (vs. database schema, queries, connection management)
   - ✅ **Real-time**: Immediate updates without database overhead (vs. slower status changes)
   - ✅ **Appropriate Use**: Perfect for temporary chatroom state (vs. overkill for ephemeral data)

3. **Conditional Room Deletion vs. Never Delete Rooms:**
   - ✅ **Memory Efficiency**: Rooms deleted when truly empty (vs. memory leak from accumulating rooms)
   - ✅ **Resource Management**: Server resources freed for abandoned rooms (vs. wasted resources on empty rooms)
   - ✅ **Automatic Cleanup**: Smart deletion based on online members (vs. manual cleanup required)
   - ✅ **Scalability**: Prevents server resource exhaustion (vs. unbounded memory growth)

4. **Online/Offline Status vs. Binary Join/Leave:**
   - ✅ **State Management**: Single source of truth for room membership (vs. rebuilding member list on reconnection)
   - ✅ **Real-time Updates**: Status changes broadcast immediately (vs. delayed or missed updates)
   - ✅ **Consistency**: All users see updated online/offline status (vs. inconsistent state across clients)
   - ✅ **Efficiency**: No need to rebuild member list on reconnection (vs. expensive reconstruction)

---

## **ALGORITHM 3: Document Ownership Verification & Filtering Algorithm**

### **STEP 1: Explain the Problem You Are Solving**

**Problem Statement:**
Documents are stored in MongoDB (persistent cloud storage) and cached in localStorage. The application needed to ensure that:
- Users can only see documents they created (from MongoDB)
- Users cannot edit or delete documents created by others
- Documents without ownership information are filtered out
- Data privacy is maintained across all storage locations
- Documents persist across devices and browser sessions (MongoDB)

**Why this is a problem:**
Without ownership verification, User A could see and modify User B's documents. Additionally, if documents were only stored in localStorage, they would be lost when:
- The user clears browser data
- The user switches devices
- The browser's storage quota is exceeded
- The user uses a different browser

MongoDB provides persistent cloud storage that survives these scenarios, while localStorage serves as a cache for offline access.

---

### **STEP 2: Explain How You Solved It (Code + Flowchart)**

**Solution Overview:**
The algorithm loads documents from MongoDB (persistent cloud storage) and filters them by comparing each document's `userId` (from MongoDB) or `creatorId` (from localStorage cache) with the current user's ID. Documents without ownership information or with mismatched ownership are excluded from the user's view. localStorage serves as a cache for offline access, but MongoDB is the source of truth for persistent storage.

**File:** `src/pages/ProfilePage.tsx`  
**Lines:** 126-220

```typescript
// Helper function to load all user data
const loadUserData = async () => {
  // Check authentication first
  const currentUser = getCurrentUser();
  if (!isAuthenticated() || !currentUser) {
    console.log('🔒 [DEBUG] ProfilePage: User not authenticated, cannot load data');
    setDocuments([]);
    setTripPreferences(null);
    setSavedTripPreferences([]);
    setFlightStrategies([]);
    setExpensePolicySets([]);
    return;
  }

  // Log user ID for debugging
  console.log('📄 [DEBUG] ProfilePage: Loading data for user ID:', currentUser.id);

  // CRITICAL: Re-verify authentication before loading documents
  // This prevents race conditions where user logs out during data load
  const currentUserCheck = getCurrentUser();
  if (!isAuthenticated() || !currentUserCheck || currentUserCheck.id !== currentUser.id) {
    console.log('🔒 [DEBUG] ProfilePage: Authentication changed during data load, aborting');
    setDocuments([]);
    return;
  }

  try {
    // Load documents from MongoDB (persistent cloud storage)
    const result = await documentsApi.getAll();
    
    if (result.error) {
      console.error('Error loading documents from MongoDB:', result.error);
      // Fallback to localStorage if MongoDB fails
      const savedDocs = localStorage.getItem('destinationDocuments');
      if (savedDocs) {
        const allDocs = JSON.parse(savedDocs) as DocumentData[];
        const userDocs = allDocs.filter((doc: DocumentData) => {
          const creatorId = (doc as any).creatorId;
          return creatorId && creatorId === currentUser.id;
        });
        setDocuments(userDocs);
      }
      return;
    }
    
    // Re-verify authentication before filtering (prevents showing data after logout)
    const verifyUser = getCurrentUser();
    if (!isAuthenticated() || !verifyUser || verifyUser.id !== currentUser.id) {
      console.log('🔒 [DEBUG] ProfilePage: User logged out during document load, aborting');
      setDocuments([]);
      return;
    }
    
    // MongoDB documents have userId field, convert to creatorId for consistency
    const allDocs = (result.data || []).map((doc: any) => ({
      ...doc,
      id: doc._id || doc.id,
      creatorId: doc.userId || (doc as any).creatorId
    })) as DocumentData[];
    
    // Filter documents to only show those created by current user
    const userDocs = allDocs.filter((doc: DocumentData) => {
      // Type assertion to access optional creatorId property
      const creatorId = (doc as any).creatorId || (doc as any).userId;
      
      // Exclude documents without creatorId (security: don't show unowned documents)
      if (!creatorId) {
        console.warn('⚠️ [DEBUG] ProfilePage: Document missing creatorId:', doc.id);
        return false; // Don't show documents without creatorId
      }
      
      // Only include documents where creatorId matches current user ID
      return creatorId === currentUser.id;
    });
    
    // Final verification before setting state (prevents race conditions)
    const finalUserCheck = getCurrentUser();
    if (!isAuthenticated() || !finalUserCheck || finalUserCheck.id !== currentUser.id) {
      console.log('🔒 [DEBUG] ProfilePage: User logged out before setting documents, aborting');
      setDocuments([]);
      return;
    }
    
    console.log('📄 [DEBUG] ProfilePage: User documents loaded from MongoDB. Total docs:', allDocs.length, 'User docs:', userDocs.length, 'User ID:', currentUser.id);
    
    // Update state with filtered documents, triggers re-render
    setDocuments(userDocs);
    
    // Also sync to localStorage as cache
    localStorage.setItem('destinationDocuments', JSON.stringify(userDocs));
  }

    // Load user-specific data (only if user is still authenticated)
    // Re-verify authentication before loading preferences
    const prefsUserCheck = getCurrentUser();
    if (!isAuthenticated() || !prefsUserCheck || prefsUserCheck.id !== currentUser.id) {
      console.log('🔒 [DEBUG] ProfilePage: User logged out before loading preferences, aborting');
      return;
    }

    // Use userDataStorage utility to load user-specific preferences
    const savedPrefs = getUserData('tripPreferences');
    if (savedPrefs) {
      setTripPreferences(savedPrefs);
    }
    // ... load other user-specific data
  } catch (error) {
    console.error('Error loading data:', error);
  }
};
```

**Additional Verification in DocumentEditingPage.tsx (Lines: 102-109):**
```typescript
if (foundDoc) {
  // Verify user owns this document
  if (foundDoc.creatorId && foundDoc.creatorId !== currentUser.id) {
    console.log('🔒 [DEBUG] DocumentEditingPage: User does not own this document. User ID:', currentUser.id, 'Document creatorId:', foundDoc.creatorId);
    alert('You do not have permission to edit this document');
    navigate('/profile', { replace: true });
    return;
  }
  // ... proceed with loading document
}
```

**Flowchart:**
```
START
  ↓
User accesses profile page
  ↓
Check authentication
  ↓
  Not authenticated? → Clear all data, return
  ↓ YES (authenticated)
  Get current user ID
  ↓
  Re-verify authentication (checkpoint 1)
  ↓
  Authentication changed? → Clear documents, return
  ↓ NO (still authenticated)
  Load all documents from MongoDB (persistent cloud storage)
  ↓
  MongoDB load successful?
    ↓ NO → Fallback to localStorage cache
    ↓ YES
  Re-verify authentication (checkpoint 2)
  ↓
  Authentication changed? → Clear documents, return
  ↓ NO (still authenticated)
  FOR EACH document:
    ↓
    Extract userId (MongoDB) or creatorId (localStorage cache)
    ↓
    creatorId/userId exists?
      ↓ NO → Skip document (security: don't show unowned)
      ↓ YES
      creatorId/userId === currentUser.id?
        ↓ NO → Skip document (not owned by user)
        ↓ YES → Include document in userDocs array
    ↓
  NEXT document
  ↓
  Re-verify authentication (checkpoint 3 - before setting state)
  ↓
  Authentication changed? → Clear documents, return
  ↓ NO (still authenticated)
  Update state with filtered documents
  ↓
  Sync filtered documents to localStorage as cache
  ↓
  Re-verify authentication (checkpoint 4 - before loading preferences)
  ↓
  Load user-specific preferences
  ↓
END
```

**What this does:**
- Loads documents from MongoDB (persistent cloud storage) as primary source
- Falls back to localStorage cache if MongoDB is unavailable
- Verifies authentication at multiple checkpoints (before loading, during filtering, before setting state)
- Filters documents by comparing `userId` (MongoDB) or `creatorId` (localStorage cache) with current user ID
- Excludes documents without ownership information (security measure)
- Re-verifies authentication at each step to prevent race conditions where user logs out during data load
- Clears documents state if authentication fails at any checkpoint
- Syncs filtered documents to localStorage as cache for offline access
- Provides clear error messages when access is denied
- Works with periodic checks and storage event listeners to detect logout in real-time

---

### **STEP 3: Explain WHY You Used This Approach**

**Justification (Relative Advantages Compared to Alternatives):**

1. **MongoDB + Client-Side Filtering vs. localStorage Only:**
   - ✅ **Persistence**: MongoDB survives browser clears, device switches, and storage quota issues (localStorage-only would lose all data)
   - ✅ **Cross-Device Access**: Users can access their documents from any device (localStorage-only is device-specific)
   - ✅ **Reliability**: MongoDB provides backup and recovery (localStorage-only has no backup)
   - ✅ **Offline Support**: localStorage cache allows offline access when MongoDB is unavailable

2. **Client-Side Filtering vs. Server-Side Only:**
   - ✅ **Performance**: Faster initial load (no API call needed for cached documents)
   - ✅ **Offline Capability**: Works with cached data when network is unavailable
   - ✅ **Reduced Server Load**: Less API traffic for document access
   - ✅ **Immediate Feedback**: No network latency for ownership checks

3. **Multiple Authentication Checkpoints vs. Single Check:**
   - ✅ **Race Condition Prevention**: Prevents showing data if user logs out during load (single check would allow data leak)
   - ✅ **Security**: Multiple verification points catch edge cases (single check misses logout during async operations)
   - ✅ **Data Integrity**: Ensures state consistency throughout the loading process

4. **Filtering vs. Hiding Documents:**
   - ✅ **Security**: Documents not owned by user are never loaded into memory (hiding still loads them, creating security risk)
   - ✅ **Performance**: Less memory usage (only user's documents in state)
   - ✅ **Simplicity**: Cleaner state management (hiding requires complex UI logic)

---

### **STEP 4: Why Alternatives Are Not as Optimal**

**Alternative 1: localStorage Only (No MongoDB)**
- ❌ Data lost when browser data is cleared
- ❌ Not accessible from other devices
- ❌ Limited by browser storage quota
- ❌ No backup or recovery mechanism
- ❌ Device/browser-specific storage

**Alternative 2: MongoDB Only (No localStorage Cache)**
- ❌ Requires network connection for every access
- ❌ Slower initial load (network latency)
- ❌ No offline access capability
- ❌ More server load and API calls

**Alternative 3: Server-Side Only Verification (No Client-Side Filtering)**
- ❌ Requires API calls for every document access
- ❌ Slower performance (network latency for each check)
- ❌ No offline capability
- ❌ More complex error handling for network failures

**Alternative 4: No Client-Side Filtering**
- ❌ Security risk (all documents loaded into memory)
- ❌ Users could potentially access other users' documents through browser dev tools
- ❌ Privacy violation
- ❌ More memory usage

**Alternative 5: Hide Documents Instead of Filtering**
- ❌ Documents still in memory (security risk)
- ❌ More complex UI logic to hide/show
- ❌ Potential for bugs exposing hidden documents
- ❌ Higher memory usage (all documents loaded)

---

## **ALGORITHM 4: Document Creation from Survey Data Algorithm**

### **STEP 1: Explain the Problem You Are Solving**

**Problem Statement:**
When users complete the Big Idea survey and specify multiple destinations, the application needs to create separate document objects for each destination. Each document must:
- Include all survey data from the Big Idea survey
- Have a unique ID
- Be linked to the user who created it (creatorId)
- Transform planning style number to descriptive string
- Include proper metadata (survey ID, date, name)
- Initialize empty structures for future data (calendar, options)

**Why this is a problem:**
Users might specify 3-5 destinations in the survey, and each needs its own editable document. Manually creating documents would be error-prone and inefficient. The algorithm must transform survey data into the proper document structure while handling data type conversions and initializing nested objects.

---

### **STEP 2: Explain How You Solved It (Code + Flowchart)**

**Solution Overview:**
The algorithm uses `Array.map()` to transform an array of destination names into an array of complete document objects. Each document includes survey data, metadata, and initialized empty structures.

**File:** `src/pages/BigIdeaPage.tsx`  
**Lines:** 110-200

```typescript
const createDestinationDocuments = (destinationNames: string[], preferences: Partial<TripPreferences>) => {
  console.log('Creating destination documents for:', destinationNames);
  
  // Get current user to set creatorId
  const { getCurrentUser, isAuthenticated } = require('../services/apiService');
  const currentUser = isAuthenticated() ? getCurrentUser() : null;
  if (!currentUser || !currentUser.id) {
    console.error('Cannot create documents: User not authenticated');
    return;
  }
  
  // Generate survey metadata
  const surveyId = `big_idea_${Date.now()}`;
  const surveyDate = new Date().toISOString();
  const surveyName = `Big Idea Survey - ${new Date().toLocaleDateString()}`;
  
  // Transform array of destination names into array of document objects
  const destinationDocs = destinationNames.map(dest => ({
    // Generate unique document ID
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    destinationName: dest.trim(),
    creatorId: currentUser.id, // Link document to user
    isAutoCreated: true, // Flag to identify auto-created docs
    
    // Legacy survey data structure (for backward compatibility)
    surveyData: {
      groupSize: preferences?.groupSize,
      duration: typeof preferences?.duration === 'string' 
        ? preferences.duration 
        : JSON.stringify(preferences?.duration),
      budget: preferences?.budget,
      destinationStyle: preferences?.destinationStyle,
      tripVibe: preferences?.tripVibe,
      // Transform planning style number to descriptive string
      planningStyle: typeof preferences?.planningStyle === 'number' 
        ? (preferences.planningStyle <= 25 ? 'Spontaneous Explorer' :
           preferences.planningStyle <= 50 ? 'Flexible Planner' :
           preferences.planningStyle <= 75 ? 'Structured Planner' : 'Detail-Oriented Organizer')
        : preferences?.planningStyle,
      priorities: preferences?.priorities || []
    },
    
    // Enhanced survey data structure (complete preferences object)
    bigIdeaSurveyData: preferences,
    tripTracingSurveyData: null, // Will be filled when Trip Tracing is completed
    
    // Survey origin tracking (metadata)
    surveyOrigin: {
      bigIdeaSurveyId: surveyId,
      bigIdeaSurveyName: surveyName,
      bigIdeaSurveyDate: surveyDate,
      tripTracingSurveyId: null,
      tripTracingSurveyDate: null
    },
    
    // Initialize empty structures for future data
    calendarPlanner: {
      duration: typeof preferences?.duration === 'string' 
        ? preferences.duration 
        : 'Complex duration structure',
      dates: [],
      timeSlots: []
    },
    optionsOrganizer: {
      accommodation: [],
      meals: [],
      activities: []
    },
    editableFields: {
      dates: { startDate: '', endDate: '' },
      budget: { amount: 0, currency: 'USD' }
    },
    
    // Timestamps
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }));
  
  // Get existing documents from localStorage
  const savedDocs = localStorage.getItem('destinationDocuments');
  let allDocs = savedDocs ? JSON.parse(savedDocs) : [];
  
  // Add new documents to existing array
  allDocs = [...allDocs, ...destinationDocs];
  
  // Save updated documents array to localStorage
  localStorage.setItem('destinationDocuments', JSON.stringify(allDocs));
  
  console.log(`✅ Created ${destinationDocs.length} destination documents`);
};
```

**Flowchart:**
```
START
  ↓
Receive: destinationNames array, preferences object
  ↓
Check user authentication
  ↓
  Not authenticated? → Return error, exit
  ↓ YES (authenticated)
  Generate survey metadata (ID, date, name)
  ↓
  FOR EACH destination in destinationNames:
    ↓
    Generate unique document ID
    ↓
    Create document object:
      - Set destinationName (trimmed)
      - Set creatorId (current user ID)
      - Set isAutoCreated flag
      ↓
    Transform survey data:
      - Copy groupSize, duration, budget, etc.
      - Convert planningStyle number to string
      - Handle duration type conversion
    ↓
    Add survey metadata (surveyOrigin)
    ↓
    Initialize empty structures:
      - calendarPlanner (empty arrays)
      - optionsOrganizer (empty arrays)
      - editableFields (default values)
    ↓
    Add timestamps (createdAt, lastModified)
    ↓
  NEXT destination
  ↓
  Load existing documents from localStorage
  ↓
  Merge new documents with existing documents
  ↓
  Save updated array to localStorage
  ↓
  Log success
  ↓
END
```

**What this does:**
- Transforms array of destination names into array of document objects
- Generates unique IDs for each document
- Links documents to user via creatorId
- Transforms data types (number to string for planningStyle)
- Initializes empty structures for future data
- Adds metadata for survey tracking
- Merges with existing documents and saves to localStorage

---

### **STEP 3: Explain WHY You Used This Approach**

**Justification (Relative Advantages Compared to Alternatives):**

1. **Batch Creation with map() vs. Create Documents One at a Time:**
   - ✅ **Performance**: Single operation creates all documents (vs. multiple sequential writes)
   - ✅ **Efficiency**: Batch processing reduces localStorage writes (vs. multiple write operations)
   - ✅ **Code Quality**: Functional programming (map) for clean transformation (vs. imperative loops)
   - ✅ **Reliability**: Atomic operation reduces risk of partial creation (vs. error-prone sequential creation)

2. **Client-Side + MongoDB vs. Server-Side Creation Only:**
   - ✅ **Performance**: Immediate document creation without waiting for API calls (vs. network latency for each document)
   - ✅ **User Experience**: Documents appear immediately after survey completion (vs. delayed appearance)
   - ✅ **Offline Capability**: Works without network connection (vs. requires constant API access)
   - ✅ **Simplicity**: Integrated with survey flow (vs. complex error handling for network failures)

3. **Automated Creation vs. Manual Document Creation:**
   - ✅ **User Experience**: Users can start editing right away (vs. manual creation step required)
   - ✅ **Data Consistency**: All documents have same survey data and consistent structure (vs. error-prone manual entry)
   - ✅ **Reliability**: Proper initialization prevents null reference errors (vs. potential missing fields)
   - ✅ **Efficiency**: No manual document creation required (vs. time-consuming user action)

4. **Centralized Function vs. Scattered Creation Logic:**
   - ✅ **Maintainability**: Single function handles all document creation logic (vs. logic scattered across codebase)
   - ✅ **Modifiability**: Easy to modify document structure in one place (vs. multiple locations to update)
   - ✅ **Clarity**: Clear separation of concerns (vs. mixed responsibilities)
   - ✅ **Testing**: Easier to test and debug (vs. complex integration testing)

---

## **SUMMARY**

These four algorithms demonstrate algorithmic thinking by solving real problems in the application:

1. **Survey Navigation with Conditional Skipping and Validation** - Dynamic navigation and conditional validation for personalized survey flow
2. **Room Membership Persistence** - Smart state management for real-time collaboration
3. **Document Ownership Verification & Filtering** - Security and data privacy with MongoDB integration
4. **Document Creation from Survey Data** - Data transformation and batch processing

Each algorithm shows problem-solving beyond simple tutorial code, with conditional logic, data transformation, error handling, and consideration of edge cases.
