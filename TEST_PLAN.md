# Test Plan for Where To Next?

## Overview
This test plan outlines the expected results for testing all features of the Where To Next? vacation planning website. Each feature is tested under three scenarios: Normal (expected user flow), Abnormal (edge cases and errors), and Extreme (stress testing and boundary conditions).

---

## 1. All Pages & Header

### 1a. Intuitive User Interface

**Success Criterion:** The website guides the user through the process of vacation planning with an intuitive, interactive user interface.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** Standard device sizes (1920x1080 desktop, 768x1024 tablet, 375x667 mobile), standard browser (Chrome), normal internet speed (WiFi), typical user interactions (clicking, scrolling, typing)
- **Abnormal:** Unusual device sizes (4K monitor 3840x2160, small tablet 600x800), less common browsers (Opera, Brave), slow but stable internet (3G), unusual screen orientations (portrait on desktop, landscape on mobile)
- **Extreme:** Extremely small screens (240x320), unsupported browsers (IE11), no internet connection, browser zoom at 50% or 200%, browser with JavaScript disabled, browser with cookies/localStorage disabled

#### Normal:
**Expected:**
- User can navigate between all pages (Home, Big Idea, Trip Tracing, Profile, etc.) using header navigation buttons
- Header displays correctly on all pages with consistent styling
- "Where To Next?" logo and title are visible and clickable, redirecting to homepage
- All header buttons (Shared, Chat, Profile) are functional and navigate to correct pages
- Website is responsive and works on desktop (1920x1080), tablet (768x1024), and mobile (375x667) devices
- Page transitions are smooth with appropriate loading states
- User can access the website from different browsers (Chrome, Safari, Firefox, Edge)
- Interactive elements (buttons, cards, modals) respond correctly to user clicks and hovers
- Color scheme (coral/pink and green) is consistent throughout all pages
- Hero section on homepage displays correctly with background image

#### Abnormal:
**Expected:**
- Website adapts correctly to 4K monitor (3840x2160) with proper scaling and layout
- Website works correctly on small tablet (600x800) with readable text and accessible buttons
- Website functions in Opera and Brave browsers with all features working
- Website remains usable on 3G connection with slower loading but all features functional
- Portrait orientation on desktop and landscape on mobile display correctly
- Header remains functional even if some page content fails to load
- Navigation works correctly even if localStorage is disabled (falls back to session-based auth)

#### Extreme:
**Expected:**
- Website loads and functions correctly on extremely small screens (240x320) with scrollable content
- Website shows appropriate error message or fallback when JavaScript is disabled
- Website handles browser zoom at 50% and 200% without breaking layout or functionality
- Website works correctly when cookies/localStorage are disabled (shows appropriate messages)
- Website handles rapid clicking on navigation buttons without breaking or showing duplicate pages
- Header remains accessible and functional even if main page content takes a long time to load
- Website displays error message when no internet connection is available but allows cached content access

### 1b. Cross-Device Account Access

**Success Criterion:** The user can log into their account on this website anywhere on any device.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** Typical user login credentials (email: user@example.com, password: password123), standard device sizes (1920x1080 desktop, 768x1024 tablet, 375x667 mobile), standard browser (Chrome), normal internet speed (WiFi)
- **Abnormal:** Very long email addresses (50+ characters), very short passwords (exactly 8 characters), unusual device sizes (4K monitor, small tablet), less common browsers (Opera, Brave), slow but stable internet (3G)
- **Extreme:** Invalid email formats (no @ symbol, spaces in email), passwords with special characters that might break SQL, extremely small screens (240x320), unsupported browsers (IE11), no internet connection, malformed authentication tokens

#### Normal:
**Expected:**
- User can successfully log in with valid email (user@example.com) and password (password123) on desktop (1920x1080)
- User can successfully log in with same credentials on tablet (768x1024) and mobile (375x667)
- User can log in from Chrome, Safari, Firefox, and Edge browsers
- Login modal displays correctly with email and password fields
- After login, user's name appears in header (e.g., "Welcome, [Name]!")
- Logout button appears when logged in and successfully logs user out
- Authentication state persists across page refreshes
- User can access protected pages (Profile, Document Editing) after login
- Login works correctly on WiFi connection with normal speed

#### Abnormal:
**Expected:**
- User can log in with very long email (50+ characters) - system accepts and stores correctly
- User can log in with exactly 8-character password - minimum length requirement met
- User can log in on 4K monitor and small tablet - authentication works on all screen sizes
- User can log in from Opera and Brave browsers - authentication system is browser-agnostic
- User can log in on 3G connection - slower but authentication completes successfully
- If user is logged out mid-session, header updates to show login/register buttons
- If authentication token expires, user is redirected to login page with appropriate message
- If user closes browser and reopens, login state persists (token stored in localStorage)

#### Extreme:
**Expected:**
- System rejects login with invalid email format (no @ symbol) - shows validation error "Please provide a valid email"
- System rejects login with email containing spaces - shows validation error
- System handles passwords with special characters (e.g., "P@ssw0rd!@#$") correctly without SQL injection
- System shows appropriate error message when trying to login on unsupported browser (IE11)
- System shows "Network error" message when trying to login with no internet connection
- System rejects malformed authentication tokens - redirects to login page
- System handles login attempts on extremely small screens (240x320) - login modal is accessible
- System prevents SQL injection in email/password fields - special characters are properly escaped

---

## 2. Big Idea & Trip Tracing Survey Pages

**Success Criterion:** The website helps the user to identify their expectations for this trip and their preferences for any options.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** Group size: 2-4 people, duration: 1-2 weeks, budget: $2000-5000, common destinations (Paris, Tokyo, New York), standard preferences (relaxation, cultural), typical planning style (balanced)
- **Abnormal:** Very large groups (10+ people), very long trips (3+ months), very high budgets ($50,000+), unusual destinations (Antarctica, remote islands), uncommon combinations (solo travel with group activities), extreme planning styles (completely unplanned or completely planned)
- **Extreme:** Negative budget values, zero duration, group size of 0 or negative numbers, destinations with special characters that break parsing, emoji-only inputs, SQL injection attempts in text fields, XSS attempts in custom fields, extremely long text inputs (10,000+ characters), binary data in text fields

### Normal:
**Expected:**
- User can access Big Idea survey from homepage "Start big idea survey" button
- All 9 questions in Big Idea survey are displayed sequentially with clear instructions
- User can select group size (2-4 people) and it is saved correctly
- User can select duration (1-2 weeks) and it is saved correctly
- User can enter budget ($2000-5000) and it is saved correctly
- User can select common destinations (Paris, Tokyo, New York) and they are saved correctly
- User can select standard preferences (relaxation, cultural) and they are saved correctly
- User can select typical planning style (balanced) and it is saved correctly
- Selected options are visually highlighted (emerald border, emerald background)
- Progress bar at top shows completion percentage (e.g., "Question 3 of 9")
- User can navigate between questions using "Previous" and "Next" buttons
- User can see their selected answers when going back to previous questions
- Survey validates that required questions are answered before proceeding
- User can save survey progress and resume later from profile page
- After completing Big Idea survey, user can proceed to Trip Tracing survey
- Trip Tracing survey loads with 7 sections (Accommodation, Travel Method, Flight, Transportation, Meal Patterns, Expenses, Food Preferences)
- Each Trip Tracing section allows multiple selections and custom input where applicable
- User can save flight booking strategies and expense policies for reuse
- Survey data is saved to user's account and persists across sessions

### Abnormal:
**Expected:**
- User can select very large group size (10+ people) and system accepts it correctly
- User can select very long trip duration (3+ months) and system calculates and stores it correctly
- User can enter very high budget ($50,000+) and system accepts and formats it correctly
- User can select unusual destinations (Antarctica, remote islands) and system handles them correctly
- User can select uncommon combinations (solo travel with group activities) - system allows but may show warnings
- User can select extreme planning styles (completely unplanned or completely planned) and system saves them correctly
- If user closes browser mid-survey, they receive warning about unsaved progress
- If user tries to navigate away during survey, browser shows confirmation dialog
- If user's session expires during survey, progress is saved to localStorage and can be recovered
- If network fails during survey submission, data is saved locally and synced when connection restored
- If user has multiple saved surveys, they can choose which one to resume from profile page

### Extreme:
**Expected:**
- System rejects negative budget values - shows validation error "Budget must be a positive number"
- System rejects zero duration - shows validation error or requires user to select valid duration
- System rejects group size of 0 or negative numbers - shows validation error
- System handles destinations with special characters correctly - properly escapes and stores them
- System handles emoji-only inputs in text fields - stores them correctly without breaking
- System prevents SQL injection in text fields - special characters are properly escaped, no database errors occur
- System prevents XSS in custom fields - script tags are sanitized, no script execution occurs
- System handles extremely long text inputs (10,000+ characters) - either truncates with warning or stores correctly
- System rejects binary data in text fields - shows validation error or converts to text safely
- User can complete entire Big Idea survey (9 questions) and Trip Tracing survey (7 sections) in one session
- Survey handles rapid clicking between questions without losing data
- Survey works correctly if user spends extended time on one question (no timeout issues)
- Survey progress bar accurately reflects completion even with complex answer structures
- User can complete surveys on mobile device with small screen without usability issues
- Survey saves correctly even if user's device has very limited storage space
- Multiple users can complete surveys simultaneously without data conflicts

---

## 3. Profile Page

**Success Criterion:** The website allows the user to save their survey results and review their preferences.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** 1-3 saved preference sets, 2-5 documents, 1-2 flight strategies, 1-2 expense policy sets, standard preference names (e.g., "Summer Trip 2024"), typical document names (e.g., "Paris Vacation")
- **Abnormal:** Maximum number of saved preferences (4 sets), many documents (20+), many flight strategies (10+), very old saved preferences (6+ months old), very long preference/document names (50+ characters), preference sets with all possible options selected
- **Extreme:** Preference names with special characters (SQL injection attempts), document names with emoji only, empty preference sets, corrupted preference data, preference sets with null/undefined values, extremely long names (200+ characters), names with script tags (XSS attempts), binary data in preference names

### Normal:
**Expected:**
- User can access profile page from header "Profile" button
- Profile page displays user's latest Big Idea survey results with all preferences visible
- Saved trip preferences section shows 1-3 saved preference sets with names like "Summer Trip 2024"
- Each saved preference set shows: name, group size, duration, budget, creation date
- Profile page displays 2-5 documents with names like "Paris Vacation"
- User can see 1-2 flight booking strategies saved during Trip Tracing
- User can see 1-2 expense policy sets saved during Trip Tracing
- User can click "Resume" button (▶️) to continue from a saved survey
- User can click "Get AI Prompt" button (🤖) to generate AI prompt from saved preferences
- User can delete saved preference sets
- User can edit documents from profile page
- Account settings sidebar shows current name and allows name change
- Account settings sidebar has delete account button with proper warnings

### Abnormal:
**Expected:**
- Profile page displays maximum 4 saved preference sets - oldest ones are removed when new ones are added
- Profile page loads and displays 20+ documents correctly with pagination or scrolling
- Profile page displays 10+ flight strategies in organized grid layout
- Profile page displays very old saved preferences (6+ months old) with correct dates and data
- Profile page handles very long preference/document names (50+ characters) - text is truncated or wrapped appropriately
- Profile page displays preference sets with all possible options selected - all data is visible and organized
- If user has no saved surveys, profile page shows message "You haven't completed the big idea survey yet"
- If user has no documents, profile page shows "No documents yet" message
- If user has no flight strategies or expense policies, appropriate empty state messages are shown
- If user tries to delete a preference set, confirmation is requested
- If user's data fails to load from database, profile page shows error message but doesn't crash
- If user is logged out while viewing profile, they are redirected to homepage

### Extreme:
**Expected:**
- System handles preference names with SQL injection attempts - special characters are escaped, no database errors
- System handles document names with emoji only - displays correctly without breaking layout
- System handles empty preference sets - shows appropriate message or hides them
- System handles corrupted preference data - shows error message or falls back to default values
- System handles preference sets with null/undefined values - displays "Not specified" or empty state
- System handles extremely long names (200+ characters) - truncates with ellipsis or wraps text
- System prevents XSS in preference/document names - script tags are sanitized, no script execution
- System rejects binary data in preference names - shows validation error or converts safely
- Profile page loads correctly even with 100+ documents
- User can manage multiple saved preference sets without performance degradation
- Profile page works correctly if user has saved preferences from months ago
- Account settings work correctly even if user's name is very long (50+ characters)
- Profile page handles rapid clicking on action buttons (resume, delete, etc.) without errors
- Profile page correctly displays all data even if user has completed surveys on multiple devices

---

## 4. Summary Page & AI Prompt Popup

**Success Criterion:** The website provides an AI prompt for creating the vacation plan with the summary of the user's preferences.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** Complete survey with all questions answered, standard preferences (2-3 trip vibes, 3-5 priorities), typical destination approach (1-2 specific destinations or open to suggestions), normal prompt length (500-2000 characters)
- **Abnormal:** Survey with all possible options selected, maximum number of trip vibes and priorities, very long custom destination lists (10+ destinations), prompts with maximum length (5000+ characters), surveys with unusual preference combinations
- **Extreme:** Incomplete survey data (missing required fields), null/undefined values in preferences, prompts with SQL injection attempts, prompts with XSS attempts, prompts with binary data, extremely long prompts (50,000+ characters), prompts with only special characters, corrupted survey data structure

### Normal:
**Expected:**
- After completing Big Idea survey with all questions answered, user is redirected to Summary page
- Summary page displays all user's survey responses in organized sections
- Summary page shows "Your Travel Profile" with all preferences clearly listed
- User can see trip vibe (2-3 selected), planning style, priorities (3-5 selected), and other key preferences
- User can see typical destination approach (1-2 specific destinations or open to suggestions)
- User can create destination documents from summary page
- User can click "Continue to trip tracing" button to proceed to next survey
- After completing Trip Tracing, user can click "Continue to AI Prompt" button
- AI Prompt popup displays with two sections: "Step 1: Preferences Prompt" and "Step 2: Destination Prompt"
- Prompt length is normal (500-2000 characters) and displays correctly
- User can edit both prompts using "Edit Prompt" button
- User can copy prompts to clipboard using "Copy Prompt" button
- Copied prompts show "Copied!" confirmation message
- User can reset edited prompts to original using "Reset" button
- AI Prompt popup shows "Pro Tips" section with helpful guidance
- AI Prompt popup shows links to popular AI tools (ChatGPT, Claude, Gemini)
- User can close AI prompt popup and return to summary or profile

### Abnormal:
**Expected:**
- Summary page displays survey with all possible options selected - all data is shown correctly
- Summary page handles maximum number of trip vibes and priorities - all are displayed in organized format
- Summary page displays very long custom destination lists (10+ destinations) - all destinations are listed
- AI Prompt popup handles prompts with maximum length (5000+ characters) - text is scrollable and editable
- AI Prompt popup generates correctly for surveys with unusual preference combinations
- If user hasn't completed Big Idea survey, summary page redirects to Big Idea survey
- If AI prompt generation fails, user sees error message with option to retry
- If user edits prompt but doesn't save, changes are lost when closing popup
- If clipboard API is unavailable, copy button shows error or alternative method
- If user has incomplete survey data, AI prompt still generates with available information
- If network fails during prompt generation, user can retry or use cached version

### Extreme:
**Expected:**
- System handles incomplete survey data (missing required fields) - shows error message or generates prompt with available data
- System handles null/undefined values in preferences - displays "Not specified" or skips those fields
- System prevents SQL injection in prompts - special characters are escaped, no database errors
- System prevents XSS in prompts - script tags are sanitized, no script execution when copying
- System rejects binary data in prompts - shows validation error or converts safely
- System handles extremely long prompts (50,000+ characters) - either truncates with warning or allows with performance considerations
- System handles prompts with only special characters - displays correctly or shows validation error
- System handles corrupted survey data structure - shows error message or falls back to default prompt
- AI prompt popup works correctly with very long prompts (5000+ characters)
- User can edit and copy prompts multiple times without performance issues
- AI prompt generates correctly even if user has selected all possible options in surveys
- AI prompt popup remains functional even if user has browser extensions that modify clipboard
- User can generate multiple AI prompts from different saved preference sets
- AI prompt popup displays correctly on mobile devices with small screens
- Prompt generation works correctly even if user's survey data is very complex (multiple destinations, many preferences)

---

## 5. Profile Page & Document Editing Page

**Success Criterion:** The website allows the user to organize their vacation plan into a document and manage it.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** Document name: "Paris Trip 2024", dates: valid date range (e.g., 2024-06-01 to 2024-06-14), budget: $3000-5000, 3-5 accommodation options, 5-10 meal options, 5-10 activity options, standard transportation methods
- **Abnormal:** Very long document names (100+ characters), very long date ranges (6+ months), very high budgets ($100,000+), many options (50+ accommodation, 50+ meal, 50+ activity), unusual date ranges (past dates, far future dates 10+ years), very long notes (2000+ characters per field)
- **Extreme:** Document names with SQL injection attempts, dates with invalid formats (text instead of dates), negative budget values, dates where end is before start, document names with XSS attempts, binary data in all fields, extremely long inputs (100,000+ characters), null/undefined values in required fields, special characters that break JSON parsing

### Normal:
**Expected:**
- User can create new documents from summary page after completing surveys
- User can access document editing page from profile page by clicking edit button (✏️)
- User can edit document name (e.g., "Paris Trip 2024") at the top of the page
- User can input start date (2024-06-01) and end date (2024-06-14), and duration auto-calculates (e.g., "14 days")
- User can enter budget ($3000-5000) and it is saved correctly
- User can add 3-5 accommodation options and they are saved correctly
- User can add 5-10 meal options and they are saved correctly
- User can add 5-10 activity options and they are saved correctly
- User can select standard transportation methods and they are saved correctly
- Document editing page displays all sections: Survey Origin, Big Idea Survey, Group Members, Dates & Duration, Budget, Transportation, Expense Sharing, Group Rules, Options Organizer
- User can select flight as primary transportation method via checkbox
- When flight checkbox is checked, user can select from saved flight booking strategies
- Selected flight strategy is added to transportation planning notes
- User can save document changes, and changes persist to database
- User can delete documents from profile page
- User can finalize documents, which creates a read-only finalized version

### Abnormal:
**Expected:**
- User can enter very long document names (100+ characters) - system accepts and displays them correctly
- User can enter very long date ranges (6+ months) - duration calculates correctly (e.g., "6 months, 2 weeks")
- User can enter very high budgets ($100,000+) - system accepts and formats them correctly
- User can add many options (50+ accommodation, 50+ meal, 50+ activity) - all options are saved and displayed
- User can enter unusual date ranges (past dates, far future dates 10+ years) - system accepts them but may show warnings
- User can enter very long notes (2000+ characters per field) - system saves and displays them correctly with scrolling
- If user tries to edit document without being logged in, they are redirected to login
- If user tries to edit document they don't own, they see permission error
- If document save fails due to network error, user sees error message and can retry
- If user deletes a document, confirmation dialog appears before deletion
- If user has unsaved changes and tries to navigate away, browser shows warning
- If document data fails to load, user sees error message with option to reload
- If user's session expires during editing, changes are saved to localStorage and can be recovered

### Extreme:
**Expected:**
- System prevents SQL injection in document names - special characters are escaped, no database errors
- System rejects dates with invalid formats (text instead of dates) - shows validation error "Please enter a valid date"
- System rejects negative budget values - shows validation error "Budget must be a positive number"
- System rejects dates where end is before start - shows validation error "End date must be after start date"
- System prevents XSS in document names - script tags are sanitized, no script execution
- System rejects binary data in fields - shows validation error or converts safely
- System handles extremely long inputs (100,000+ characters) - either truncates with warning or allows with performance considerations
- System handles null/undefined values in required fields - shows validation error or uses default values
- System handles special characters that break JSON parsing - properly escapes them, no parsing errors
- Document editing page works correctly with very long document names (100+ characters)
- User can add many options (50+ accommodation options, 50+ meal options, 50+ activity options)
- Document saves correctly even with very large amounts of text in notes fields
- Document editing page remains responsive even with complex document structures
- User can edit multiple documents in different browser tabs simultaneously
- Document editing works correctly on mobile devices with touch input
- Document saves correctly even if user makes rapid changes to multiple fields
- Document handles very long date ranges (e.g., 6-month trip) correctly

---

## 6. Finalized Document Page & View Shared Document

**Success Criterion:** The website provides a finalized look of their plan and shares it with other users. The invited user can't edit the document.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** Valid 6-character share code (e.g., "ABC123"), document with standard content, 1-3 users accessing shared document, share code used within 24 hours of creation
- **Abnormal:** Share codes with mixed case (e.g., "AbC123"), very old share codes (months old), documents with maximum content (all fields filled), many users accessing simultaneously (10+), share codes used multiple times by different users
- **Extreme:** Invalid share code formats (wrong length: "ABC" or "ABCDEFG", special characters: "ABC!@#", SQL injection: "'; DROP--", XSS attempts: "<script>"), non-existent share codes, deleted document share codes, share codes with only numbers, share codes with only letters, empty share codes, share codes with spaces, share codes with unicode characters

### Normal:
**Expected:**
- User can finalize a document from profile page using finalize button (✅)
- Finalized document page displays all document information in organized, read-only format
- Finalized document shows: document name, creation date, survey origin, all preferences, options, and planning details
- User can share document by clicking share button, which generates a valid 6-character share code (e.g., "ABC123")
- Share code is displayed in modal with copy button
- User can copy share code to clipboard
- Other users (1-3 users) can access shared document by entering share code "ABC123" in "View Document by Code" modal
- Shared document displays in read-only mode for invited users
- Invited users can see all document content but cannot edit any fields
- Invited users see "View Only" indicators throughout the document
- Document creator can see access count and who has viewed the document
- Share code is case-insensitive (e.g., "ABC123" = "abc123")
- Share code works correctly when used within 24 hours of creation

### Abnormal:
**Expected:**
- Share code with mixed case (e.g., "AbC123") works correctly - system accepts it case-insensitively
- Very old share codes (months old) still work correctly - codes remain valid unless document is deleted
- Documents with maximum content (all fields filled) display correctly in finalized and shared views
- Many users (10+) can access shared document simultaneously - all can view without conflicts
- Share codes used multiple times by different users work correctly - each access is logged
- If user enters invalid share code (wrong length or format), error message is displayed
- If share code doesn't exist or document is deleted, user sees "Document not found" error
- If user tries to edit shared document, no edit controls are available (read-only enforced)
- If document creator deletes document, shared link becomes invalid
- If user tries to access shared document without internet, appropriate error is shown
- If share code is expired or revoked, user cannot access document
- If user copies share code but document is deleted before they use it, they see error when trying to access

### Extreme:
**Expected:**
- System rejects share codes with wrong length ("ABC" or "ABCDEFG") - shows error "Share code must be 6 characters"
- System rejects share codes with special characters ("ABC!@#") - shows error "Invalid share code format"
- System prevents SQL injection in share codes ("'; DROP--") - special characters are escaped, no database errors
- System prevents XSS in share codes ("<script>") - script tags are sanitized, no script execution
- System shows "Document not found" error for non-existent share codes
- System shows "Document not found" error for deleted document share codes
- System accepts share codes with only numbers (e.g., "123456") - works correctly
- System accepts share codes with only letters (e.g., "ABCDEF") - works correctly
- System rejects empty share codes - shows error "Please enter a share code"
- System rejects share codes with spaces - shows error or trims spaces
- System handles share codes with unicode characters - either accepts or shows validation error appropriately
- Share code works correctly even if copied and pasted multiple times
- Multiple users (10+) can view the same shared document simultaneously without issues
- Shared document displays correctly even with very large amounts of content
- Share code remains valid for extended periods (weeks/months) unless document is deleted
- Shared document page loads correctly even with very slow internet connection
- User can share document and access it from different devices using the same code
- Share code is unique and doesn't conflict with other document codes
- Shared document view works correctly on all device types and screen sizes

---

## 7. Chat Box

**Success Criterion:** The users can communicate with other users on the website through private chat.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** Room name: "Paris Trip Planning", 2-5 users in room, messages: 10-50 messages, message length: 50-200 characters, standard message content (text only), share code: valid 6-character code
- **Abnormal:** Very long room names (50+ characters), maximum users in room (20 users), many messages (1000+ messages), very long messages (1000+ characters), messages with emoji and special characters, room with users joining/leaving frequently, very old rooms (weeks old)
- **Extreme:** Room names with SQL injection attempts, room names with XSS attempts, messages with binary data, messages with script tags, extremely long messages (100,000+ characters), invalid share codes, share codes that don't exist, empty room names, room names with only special characters, messages with null/undefined values, malformed WebSocket messages

### Normal:
**Expected:**
- User can create a collaboration room with name "Paris Trip Planning" from chat modal
- User can set room name and maximum number of users
- Room creation generates a unique 6-character share code
- 2-5 users can join the room successfully
- Chat interface displays 10-50 messages in history with timestamps
- Messages are 50-200 characters long and display correctly
- Standard message content (text only) is sent and received correctly
- User can invite others by sharing the room code
- Invite modal displays share code with copy functionality
- User can share room code via email
- Other users can join room by entering share code in "Join room" modal
- Chat interface displays two tabs: "Chat" and "Users"
- Chat tab shows message history with timestamps
- Users tab shows list of online users in the room (2-5 users)
- User can type messages in input field and send them
- Messages appear in real-time for all users in the room
- User can see when other users are typing (typing indicator)
- User can see unread message count in header chat button
- User can leave room, which removes them from user list
- User can delete room, which disconnects all users

### Abnormal:
**Expected:**
- User can create room with very long room names (50+ characters) - name is stored and displayed correctly
- Room with maximum users (20 users) works correctly - all users can chat simultaneously
- Chat interface handles many messages (1000+ messages) - messages are scrollable and searchable
- Chat handles very long messages (1000+ characters) - messages wrap correctly and are readable
- Chat handles messages with emoji and special characters - all characters display correctly
- Room with users joining/leaving frequently works correctly - user list updates in real-time
- Very old rooms (weeks old) still function correctly - message history is preserved
- If user tries to join room with invalid code, error message is displayed
- If room is full (reached max users), new users cannot join - shows "Room is full" error
- If user loses internet connection, they are marked as offline but remain in user list
- If user's session expires, they are removed from room
- If user tries to send empty message, message is not sent
- If WebSocket connection fails, user sees connection error and can retry
- If user closes browser, they are marked as offline but can rejoin room when they return
- If room creator deletes room, all users are disconnected and see notification

### Extreme:
**Expected:**
- System prevents SQL injection in room names - special characters are escaped, no database errors
- System prevents XSS in room names - script tags are sanitized, no script execution
- System rejects messages with binary data - shows validation error or converts safely
- System prevents XSS in messages - script tags are sanitized, no script execution when displaying
- System handles extremely long messages (100,000+ characters) - either truncates with warning or allows with performance considerations
- System shows "Invalid share code" error for invalid share codes
- System shows "Room not found" error for share codes that don't exist
- System requires room name - shows validation error for empty room names
- System rejects room names with only special characters - shows validation error
- System handles messages with null/undefined values - displays empty message or shows error
- System handles malformed WebSocket messages - gracefully ignores or shows connection error
- Chat works correctly with maximum number of users in room (e.g., 20 users)
- Chat handles rapid message sending (multiple messages per second) without lag
- Chat displays correctly even with very long messages (1000+ characters)
- Chat works correctly with many messages in history (1000+ messages)
- Multiple users can type simultaneously without conflicts
- Chat remains functional even with slow internet connection
- Chat works correctly when users join and leave frequently
- Chat handles emoji and special characters in messages correctly
- Chat works correctly on mobile devices with touch input
- Chat reconnects automatically if connection is temporarily lost

---

## Testing Notes

### General Testing Guidelines:
- Test on multiple browsers: Chrome, Safari, Firefox, Edge
- Test on multiple devices: Desktop, Tablet, Mobile (iOS and Android)
- Test with different internet speeds: Fast (WiFi), Medium (4G), Slow (3G)
- Test with different screen sizes: Large desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- Test with browser zoom levels: 50%, 100%, 150%, 200%
- Test with browser extensions enabled and disabled
- Test with localStorage enabled and disabled
- Test with cookies enabled and disabled

### Success Criteria Summary:
- ✅ All features work as expected in normal conditions
- ✅ Error handling is graceful and user-friendly in abnormal conditions
- ✅ System remains stable and functional in extreme conditions
- ✅ User experience is consistent across all devices and browsers
- ✅ Data persistence works correctly across sessions
- ✅ Security measures prevent unauthorized access
- ✅ Performance is acceptable even under stress

---

## Test Execution Checklist

- [ ] All pages & header tested on desktop, tablet, mobile
- [ ] Big Idea & Trip Tracing surveys completed end-to-end
- [ ] Profile page displays all saved data correctly
- [ ] AI prompt generation works for all survey combinations
- [ ] Document creation and editing works for all document types
- [ ] Document sharing and viewing works with multiple users
- [ ] Chat functionality works with multiple concurrent users
- [ ] All error scenarios tested and handled appropriately
- [ ] All extreme scenarios tested for stability
- [ ] Cross-browser compatibility verified
- [ ] Cross-device compatibility verified
- [ ] Performance testing completed
- [ ] Security testing completed

---

*Last Updated: [Current Date]*
*Test Plan Version: 1.0*
