# Test Plan for Where To Next?

## Overview
This test plan outlines the expected results for testing all features of the Where To Next? vacation planning website. Each feature is tested under three scenarios: Normal (typical user input), Abnormal (valid but uncommon input), and Extreme (invalid or nonsensical input).

---

## 1. All Pages & Header

### 1a. Intuitive User Interface

**Success Criterion:** The website guides the user through the process of vacation planning with an intuitive, interactive user interface.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** User clicks header navigation buttons (Home, Big Idea, Trip Tracing, Profile) 1-2 times each, user clicks "Where To Next?" logo once, user hovers over buttons, user scrolls pages normally
- **Abnormal:** User clicks same navigation button 5-10 times rapidly, user clicks multiple different buttons in quick succession (within 1 second), user clicks buttons while page is still loading
- **Extreme:** User clicks navigation buttons 50+ times rapidly, user clicks buttons while JavaScript is disabled, user tries to click non-existent buttons

#### Normal:
**Expected:**
- User can navigate between all pages (Home, Big Idea, Trip Tracing, Profile, etc.) using header navigation buttons
- Header displays correctly on all pages with consistent styling
- "Where To Next?" logo and title are visible and clickable, redirecting to homepage
- All header buttons (Shared, Chat, Profile) are functional and navigate to correct pages
- Page transitions are smooth with appropriate loading states
- Interactive elements (buttons, cards, modals) respond correctly to user clicks and hovers
- Color scheme (coral/pink and green) is consistent throughout all pages
- Hero section on homepage displays correctly with background image

#### Abnormal:
**Expected:**
- If user clicks same navigation button 5-10 times rapidly, system handles it gracefully - only navigates once or shows loading state
- If user clicks multiple different buttons in quick succession, system processes them in order without breaking
- If user clicks buttons while page is still loading, system either queues the action or shows loading indicator
- Header remains functional even if some page content fails to load
- Navigation works correctly even if user makes rapid navigation changes

#### Extreme:
**Expected:**
- If user clicks navigation buttons 50+ times rapidly, system prevents navigation spam - may show error or rate limit
- If user tries to click buttons while JavaScript is disabled, system shows appropriate error message or fallback
- If user tries to click non-existent buttons, nothing happens (no errors, no crashes)

---

### 1b. Cross-Device Account Access

**Success Criterion:** The user can log into their account on this website anywhere on any device.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** User enters valid email (e.g., "user@example.com") and password (8+ characters), user clicks "Login" button once, user clicks "Register" button once with valid credentials
- **Abnormal:** User enters very long email (50+ characters), user enters exactly 8-character password, user clicks login button multiple times (3-5 times) before page responds, user enters email with extra spaces that they manually remove
- **Extreme:** User enters invalid email format (no @ symbol, spaces in email), user enters password with only 7 characters, user clicks login button 20+ times rapidly, user enters SQL injection attempts in email/password fields (e.g., "'; DROP TABLE--"), user enters XSS attempts in email field (e.g., "<script>alert('xss')</script>")

#### Normal:
**Expected:**
- User can successfully log in with valid email and password
- Login modal displays correctly with email and password fields
- After login, user's name appears in header (e.g., "Welcome, [Name]!")
- Logout button appears when logged in and successfully logs user out
- Authentication buttons (Login/Register) appear when user is not logged in
- User can access protected pages (Profile, Document Editing) after login
- User can register new account with valid email, password, and name

#### Abnormal:
**Expected:**
- If user enters very long email (50+ characters), system accepts and stores it correctly
- If user enters exactly 8-character password, system accepts it (meets minimum requirement)
- If user clicks login button multiple times (3-5 times) before page responds, system processes only one login request
- If user enters email with extra spaces, system trims spaces or shows validation error
- If user is logged out mid-session, header updates to show login/register buttons
- If authentication token expires, user is redirected to login page with appropriate message

#### Extreme:
**Expected:**
- If user enters invalid email format (no @ symbol), system shows validation error "Please provide a valid email"
- If user enters email with spaces, system shows validation error
- If user enters password with only 7 characters, system shows validation error "Password must be at least 8 characters long"
- If user clicks login button 20+ times rapidly, system prevents spam - may show error or rate limit
- If user enters SQL injection attempts in email/password fields, system escapes special characters - no database errors occur
- If user enters XSS attempts in email field, system sanitizes input - no script execution occurs

---

## 2. Big Idea & Trip Tracing Survey Pages

**Success Criterion:** The website helps the user to identify their expectations for this trip and their preferences for any options.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** User selects 1-2 options per question, user clicks "Next" button once per question, user clicks "Previous" button 1-2 times total, user completes all 9 questions in Big Idea survey, user completes all 7 sections in Trip Tracing survey
- **Abnormal:** User selects all available options for a question (maximum selections), user clicks "Next" button 3-5 times rapidly on same question, user goes back and forth between questions 10+ times, user spends 30+ minutes on a single question, user enters very long custom text (500+ characters) in text fields
- **Extreme:** User tries to proceed without selecting any required options, user clicks "Next" button 50+ times rapidly, user enters SQL injection attempts in text fields, user enters XSS attempts in text fields, user enters only emoji in text fields, user enters binary data or special file formats in text fields

#### Normal:
**Expected:**
- User can access Big Idea survey from homepage "Start Big Idea Survey" button
- All 9 questions in Big Idea survey are displayed sequentially with clear instructions
- User can select 1-2 options for each question (group size, duration, budget, destination approach, etc.)
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

#### Abnormal:
**Expected:**
- If user selects all available options for a question, system accepts all selections and displays them correctly
- If user clicks "Next" button 3-5 times rapidly, system processes only one navigation action
- If user goes back and forth between questions 10+ times, all selections are preserved correctly
- If user spends 30+ minutes on a single question, survey remains functional and doesn't timeout
- If user enters very long custom text (500+ characters), system accepts and stores it correctly
- If user closes browser mid-survey, they receive warning about unsaved progress
- If user tries to navigate away during survey, browser shows confirmation dialog
- If user's session expires during survey, progress is saved to localStorage and can be recovered

#### Extreme:
**Expected:**
- If user tries to proceed without selecting any required options, system shows validation error and prevents progression
- If user clicks "Next" button 50+ times rapidly, system prevents navigation spam
- If user enters SQL injection attempts in text fields, system escapes special characters - no database errors occur
- If user enters XSS attempts in text fields, system sanitizes input - no script execution occurs
- If user enters only emoji in text fields, system accepts and stores them correctly
- If user enters binary data in text fields, system rejects it or converts safely - shows validation error if needed

---

## 3. Profile Page

**Success Criterion:** The website allows the user to save their survey results and review their preferences.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** User clicks "Profile" button once, user clicks "Resume" button (▶️) once on a saved preference, user clicks "Get AI Prompt" button (🤖) once, user clicks "Delete" button once on a preference set, user has 1-3 saved preference sets, user has 2-5 documents
- **Abnormal:** User clicks action buttons (resume, delete, AI prompt) 3-5 times rapidly, user has maximum number of saved preferences (4 sets), user has many documents (20+), user clicks "Change name" button and enters very long name (50+ characters), user clicks "Delete account" button but cancels confirmation
- **Extreme:** User clicks action buttons 20+ times rapidly, user tries to delete account without confirmation, user enters SQL injection attempts in name field, user enters XSS attempts in name field, user enters only special characters in name field

#### Normal:
**Expected:**
- User can access profile page from header "Profile" button
- Profile page displays user's latest Big Idea survey results with all preferences visible
- Saved trip preferences section shows 1-3 saved preference sets
- Each saved preference set shows: name, group size, duration, budget, creation date
- User can click "Resume" button (▶️) to continue from a saved survey
- User can click "Get AI Prompt" button (🤖) to generate AI prompt from saved preferences
- User can delete saved preference sets
- Profile page displays user's documents list (2-5 documents) with creation dates and modification dates
- User can see flight booking strategies saved during Trip Tracing
- User can see expense policy sets saved during Trip Tracing
- User can edit documents from profile page
- Account settings sidebar shows current name and allows name change
- Account settings sidebar has delete account button with proper warnings

#### Abnormal:
**Expected:**
- If user clicks action buttons 3-5 times rapidly, system processes only one action per button
- If user has maximum number of saved preferences (4 sets), all are displayed and oldest ones are removed when new ones are added
- If user has many documents (20+), all are displayed in scrollable list
- If user enters very long name (50+ characters), system accepts and stores it correctly
- If user clicks "Delete account" button but cancels confirmation, account is not deleted
- If user has no saved surveys, profile page shows message "You haven't completed the Big Idea survey yet"
- If user has no documents, profile page shows "No documents yet" message
- If user has no flight strategies or expense policies, appropriate empty state messages are shown

#### Extreme:
**Expected:**
- If user clicks action buttons 20+ times rapidly, system prevents spam - may show error or rate limit
- If user tries to delete account without confirmation, system requires confirmation dialog
- If user enters SQL injection attempts in name field, system escapes special characters - no database errors occur
- If user enters XSS attempts in name field, system sanitizes input - no script execution occurs
- If user enters only special characters in name field, system either accepts it or shows validation error

---

## 4. Summary Page & AI Prompt Popup

**Success Criterion:** The website provides an AI prompt for creating the vacation plan with the summary of the user's preferences.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** User completes Big Idea survey and views summary page, user clicks "Continue to Trip Tracing" button once, user clicks "Continue to AI Prompt" button once, user clicks "Edit Prompt" button once, user clicks "Copy Prompt" button once, user clicks "Reset" button once
- **Abnormal:** User clicks "Edit Prompt" button 3-5 times rapidly, user edits prompt and makes very long changes (2000+ characters), user clicks "Copy Prompt" button multiple times (3-5 times), user clicks "Reset" button multiple times
- **Extreme:** User clicks all buttons 20+ times rapidly, user tries to edit prompt with SQL injection attempts, user tries to edit prompt with XSS attempts, user tries to copy prompt when clipboard API is blocked

#### Normal:
**Expected:**
- After completing Big Idea survey, user is redirected to Summary page
- Summary page displays all user's survey responses in organized sections
- Summary page shows "Your Travel Profile" with all preferences clearly listed
- User can see trip vibe, planning style, priorities, and other key preferences
- User can create destination documents from summary page
- User can click "Continue to Trip Tracing" button to proceed to next survey
- After completing Trip Tracing, user can click "Continue to AI Prompt" button
- AI Prompt popup displays with two sections: "Step 1: Preferences Prompt" and "Step 2: Destination Prompt"
- User can edit both prompts using "Edit Prompt" button
- User can copy prompts to clipboard using "Copy Prompt" button
- Copied prompts show "Copied!" confirmation message
- User can reset edited prompts to original using "Reset" button
- AI Prompt popup shows "Pro Tips" section with helpful guidance
- AI Prompt popup shows links to popular AI tools (ChatGPT, Claude, Gemini)
- User can close AI prompt popup and return to summary or profile

#### Abnormal:
**Expected:**
- If user clicks "Edit Prompt" button 3-5 times rapidly, system toggles edit mode correctly
- If user edits prompt and makes very long changes (2000+ characters), system accepts and stores changes correctly
- If user clicks "Copy Prompt" button multiple times, system copies prompt each time and shows confirmation
- If user clicks "Reset" button multiple times, system resets prompt to original each time
- If user hasn't completed Big Idea survey, summary page redirects to Big Idea survey
- If AI prompt generation fails, user sees error message with option to retry
- If user edits prompt but doesn't save, changes are lost when closing popup

#### Extreme:
**Expected:**
- If user clicks all buttons 20+ times rapidly, system prevents spam - may show error or rate limit
- If user tries to edit prompt with SQL injection attempts, system escapes special characters - no database errors occur
- If user tries to edit prompt with XSS attempts, system sanitizes input - no script execution occurs
- If user tries to copy prompt when clipboard API is blocked, system shows error message or alternative method

---

## 5. Profile Page & Document Editing Page

**Success Criterion:** The website allows the user to organize their vacation plan into a document and manage it.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** User creates 1-2 documents, user clicks edit button (✏️) once, user enters document name (10-30 characters), user enters valid date range (start date before end date), user adds 3-5 accommodation options, user adds 5-10 meal options, user adds 5-10 activity options, user clicks "Save" button once
- **Abnormal:** User enters very long document name (100+ characters), user enters very long date range (6+ months apart), user adds many options (50+ accommodation, 50+ meal, 50+ activity), user enters very long notes (2000+ characters per field), user clicks save button 3-5 times rapidly, user checks/unchecks flight checkbox multiple times
- **Extreme:** User enters invalid date range (end date before start date), user tries to save without entering required fields, user enters SQL injection attempts in all text fields, user enters XSS attempts in document name, user enters binary data in text fields, user clicks save button 20+ times rapidly

#### Normal:
**Expected:**
- User can create new documents from summary page after completing surveys
- User can access document editing page from profile page by clicking edit button (✏️)
- Document editing page displays all sections: Survey Origin, Big Idea Survey, Group Members, Dates & Duration, Budget, Transportation, Expense Sharing, Group Rules, Options Organizer
- User can edit document name (10-30 characters) at the top of the page
- User can input start and end dates (valid range), and duration auto-calculates from date range
- User can select flight as primary transportation method via checkbox
- When flight checkbox is checked, user can select from saved flight booking strategies
- Selected flight strategy is added to transportation planning notes
- User can add 3-5 accommodation options, 5-10 meal options, and 5-10 activity options
- User can save document changes, and changes persist to database

#### Abnormal:
**Expected:**
- If user enters very long document name (100+ characters), system accepts and stores it correctly
- If user enters very long date range (6+ months apart), duration calculates correctly
- If user adds many options (50+ each type), all options are saved and displayed correctly
- If user enters very long notes (2000+ characters per field), system accepts and stores them correctly
- If user clicks save button 3-5 times rapidly, system processes only one save request
- If user checks/unchecks flight checkbox multiple times, system toggles correctly and shows/hides strategy dropdown
- If user deletes a document, confirmation dialog appears before deletion
- If user has unsaved changes and tries to navigate away, browser shows warning

#### Extreme:
**Expected:**
- If user enters invalid date range (end before start), system shows validation error "End date must be after start date"
- If user tries to save without entering required fields, system shows validation errors for missing fields
- If user enters SQL injection attempts in text fields, system escapes special characters - no database errors occur
- If user enters XSS attempts in document name, system sanitizes input - no script execution occurs
- If user enters binary data in text fields, system rejects it or converts safely - shows validation error if needed
- If user clicks save button 20+ times rapidly, system prevents spam - may show error or rate limit

---

## 6. Finalized Document Page & View Shared Document

**Success Criterion:** The website provides a finalized look of their plan and shares it with other users. The invited user can't edit the document.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** User clicks finalize button (✅) once, user clicks share button once, user copies share code once, user enters valid 6-character share code (e.g., "ABC123"), user clicks "View Document" button once
- **Abnormal:** User copies share code multiple times (3-5 times), user enters share code with mixed case (e.g., "AbC123"), user tries to access same shared document multiple times, user shares document and multiple users (5-10) access it
- **Extreme:** User enters invalid share code format (wrong length: "ABC" or "ABCDEFG"), user enters share code with special characters ("ABC!@#"), user enters SQL injection attempts in share code ("'; DROP--"), user enters XSS attempts in share code ("<script>"), user enters empty share code, user clicks share/finalize buttons 20+ times rapidly

#### Normal:
**Expected:**
- User can finalize a document from profile page using finalize button (✅)
- Finalized document page displays all document information in organized, read-only format
- Finalized document shows: document name, creation date, survey origin, all preferences, options, and planning details
- User can share document by clicking share button, which generates a 6-character share code
- Share code is displayed in modal with copy button
- User can copy share code to clipboard
- Other users can access shared document by entering valid 6-character share code in "View Document by Code" modal
- Shared document displays in read-only mode for invited users
- Invited users can see all document content but cannot edit any fields
- Invited users see "View Only" indicators throughout the document
- Share code is case-insensitive (e.g., "ABC123" = "abc123")

#### Abnormal:
**Expected:**
- If user copies share code multiple times, system copies it each time successfully
- If user enters share code with mixed case, system accepts it case-insensitively
- If user tries to access same shared document multiple times, each access is logged correctly
- If multiple users (5-10) access shared document, all can view it simultaneously without conflicts
- If user enters invalid share code (wrong length or format), error message is displayed
- If share code doesn't exist or document is deleted, user sees "Document not found" error

#### Extreme:
**Expected:**
- If user enters invalid share code format (wrong length), system shows error "Share code must be 6 characters"
- If user enters share code with special characters, system shows error "Invalid share code format"
- If user enters SQL injection attempts in share code, system escapes special characters - no database errors occur
- If user enters XSS attempts in share code, system sanitizes input - no script execution occurs
- If user enters empty share code, system shows error "Please enter a share code"
- If user clicks share/finalize buttons 20+ times rapidly, system prevents spam - may show error or rate limit

---

## 7. Chat Box

**Success Criterion:** The users can communicate with other users on the website through private chat.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** User creates room with name (10-30 characters), user sets max users (2-10), user clicks "Create Room" button once, user enters valid 6-character share code to join, user sends 10-50 messages (50-200 characters each), user clicks "Send" button once per message
- **Abnormal:** User creates room with very long name (50+ characters), user sets max users to maximum (20), user sends very long messages (1000+ characters), user sends messages rapidly (5-10 messages within 10 seconds), user joins/leaves room multiple times (3-5 times), user copies share code multiple times (3-5 times)
- **Extreme:** User tries to create room with empty name, user tries to join with invalid share code format, user sends messages with SQL injection attempts, user sends messages with XSS attempts, user sends empty messages, user clicks send button 20+ times rapidly, user tries to send binary data as message

#### Normal:
**Expected:**
- User can create a collaboration room from chat modal
- User can set room name (10-30 characters) and maximum number of users (2-10)
- Room creation generates a unique 6-character share code
- User can invite others by sharing the room code
- Invite modal displays share code with copy functionality
- User can share room code via email
- Other users can join room by entering valid 6-character share code in "Join Room" modal
- Chat interface displays two tabs: "Chat" and "Users"
- Chat tab shows message history with timestamps
- Users tab shows list of online users in the room
- User can type messages (50-200 characters) in input field and send them
- Messages appear in real-time for all users in the room
- User can see when other users are typing (typing indicator)
- User can see unread message count in header chat button
- User can leave room, which removes them from user list
- User can delete room, which disconnects all users

#### Abnormal:
**Expected:**
- If user creates room with very long name (50+ characters), system accepts and stores it correctly
- If user sets max users to maximum (20), system accepts the setting
- If user sends very long messages (1000+ characters), system accepts and displays them correctly with wrapping
- If user sends messages rapidly (5-10 messages within 10 seconds), all messages are sent and displayed correctly
- If user joins/leaves room multiple times, system handles each join/leave correctly
- If user copies share code multiple times, system copies it each time successfully
- If user tries to join room with invalid code, error message is displayed
- If room is full (reached max users), new users cannot join

#### Extreme:
**Expected:**
- If user tries to create room with empty name, system shows validation error "Room name is required"
- If user tries to join with invalid share code format, system shows error "Invalid share code format"
- If user sends messages with SQL injection attempts, system escapes special characters - no database errors occur
- If user sends messages with XSS attempts, system sanitizes input - no script execution occurs
- If user sends empty messages, system prevents sending - message is not sent
- If user clicks send button 20+ times rapidly, system prevents spam - may show error or rate limit
- If user tries to send binary data as message, system rejects it or converts safely - shows validation error if needed

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
*Test Plan Version: 2.0*
