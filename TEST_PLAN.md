# Test Plan for Where To Next?

## Overview
This test plan outlines the expected results for testing all features of the Where To Next? vacation planning website. Each feature is tested under three scenarios: Normal (expected user flow), Abnormal (edge cases and errors), and Extreme (stress testing and boundary conditions).

---

## 1. All Pages & Header

**Success Criterion:** The website guides the user through the process of vacation planning with an intuitive, interactive user interface. The user can log into their account on this website anywhere on any device.

**Method of Testing:** Alpha testing

**Test Data:**
- **Normal:** Typical user login credentials (email: user@example.com, password: password123), standard device sizes (1920x1080 desktop, 768x1024 tablet, 375x667 mobile), standard browser (Chrome), normal internet speed (WiFi)
- **Abnormal:** Very long email addresses (50+ characters), very short passwords (exactly 8 characters), unusual device sizes (4K monitor, small tablet), less common browsers (Opera, Brave), slow but stable internet (3G)
- **Extreme:** Invalid email formats (no @ symbol, spaces in email), passwords with special characters that might break SQL, extremely small screens (240x320), unsupported browsers (IE11), no internet connection, malformed authentication tokens

### Normal:
**Expected:**
- User can navigate between all pages (Home, Big Idea, Trip Tracing, Profile, etc.) using header navigation buttons
- Header displays correctly on all pages with consistent styling
- "Where To Next?" logo and title are visible and clickable, redirecting to homepage
- Authentication buttons (Login/Register) appear when user is not logged in
- User's name appears in header when logged in (e.g., "Welcome, [Name]!")
- Logout button appears when logged in and successfully logs user out
- All header buttons (Shared, Chat, Profile) are functional and navigate to correct pages
- Website is responsive and works on desktop, tablet, and mobile devices
- Page transitions are smooth with appropriate loading states
- User can access the website from different browsers (Chrome, Safari, Firefox, Edge)

### Abnormal:
**Expected:**
- If user is logged out mid-session, header updates to show login/register buttons
- If authentication token expires, user is redirected to login page with appropriate message
- If network connection is lost, user sees error message but can continue using cached data
- If user tries to access protected pages without login, they are redirected to homepage or login modal
- Header remains functional even if some page content fails to load
- Navigation works correctly even if localStorage is disabled (falls back to session-based auth)
- If user closes browser and reopens, login state persists if "Remember me" functionality exists

### Extreme:
**Expected:**
- Website loads and functions correctly with very slow internet connection (3G speeds)
- Header and navigation work on very small screens (320px width mobile devices)
- Multiple tabs of the same website can be open simultaneously without authentication conflicts
- User can switch between devices (phone to laptop) and maintain session if using persistent storage
- Website handles rapid clicking on navigation buttons without breaking or showing duplicate pages
- Header remains accessible and functional even if main page content takes a long time to load
- Website works correctly with browser zoom levels from 50% to 200%

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
- User can access Big Idea survey from homepage "Start Big Idea Survey" button
- All 9 questions in Big Idea survey are displayed sequentially with clear instructions
- User can select options for each question (group size, duration, budget, destination approach, etc.)
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
- If user closes browser mid-survey, they receive warning about unsaved progress
- If user tries to navigate away during survey, browser shows confirmation dialog
- If user's session expires during survey, progress is saved to localStorage and can be recovered
- If user selects conflicting options (e.g., solo travel but group activities), system handles gracefully
- If user enters invalid data (e.g., negative budget), validation shows error message
- If user skips optional questions, survey still allows progression
- If network fails during survey submission, data is saved locally and synced when connection restored
- If user has multiple saved surveys, they can choose which one to resume from profile page

### Extreme:
**Expected:**
- User can complete entire Big Idea survey (9 questions) and Trip Tracing survey (7 sections) in one session
- Survey handles rapid clicking between questions without losing data
- Survey works correctly if user spends extended time on one question (no timeout issues)
- Survey can handle very long text inputs in custom fields (e.g., 1000+ character notes)
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
- Saved trip preferences section shows up to 4 most recent surveys
- Each saved preference set shows: name, group size, duration, budget, creation date
- User can click "Resume" button (▶️) to continue from a saved survey
- User can click "Get AI Prompt" button (🤖) to generate AI prompt from saved preferences
- User can delete saved preference sets
- Profile page displays user's documents list with creation dates and modification dates
- User can see flight booking strategies saved during Trip Tracing
- User can see expense policy sets saved during Trip Tracing
- User can edit documents from profile page
- Account settings sidebar shows current name and allows name change
- Account settings sidebar has delete account button with proper warnings

### Abnormal:
**Expected:**
- If user has no saved surveys, profile page shows message "You haven't completed the Big Idea survey yet"
- If user has no documents, profile page shows "No documents yet" message
- If user has no flight strategies or expense policies, appropriate empty state messages are shown
- If user tries to delete a preference set, confirmation is requested
- If user's data fails to load from database, profile page shows error message but doesn't crash
- If user is logged out while viewing profile, they are redirected to homepage
- If user has very old saved preferences, they are still accessible and display correctly
- If user has maximum number of saved preferences (4), oldest ones are automatically removed when new ones are added

### Extreme:
**Expected:**
- Profile page loads correctly even with 100+ documents
- Profile page displays correctly with very long preference names or document names
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

### Abnormal:
**Expected:**
- If user hasn't completed Big Idea survey, summary page redirects to Big Idea survey
- If AI prompt generation fails, user sees error message with option to retry
- If user edits prompt but doesn't save, changes are lost when closing popup
- If clipboard API is unavailable, copy button shows error or alternative method
- If user has incomplete survey data, AI prompt still generates with available information
- If user tries to generate prompt without completing required questions, appropriate error is shown
- If network fails during prompt generation, user can retry or use cached version

### Extreme:
**Expected:**
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
- Document editing page displays all sections: Survey Origin, Big Idea Survey, Group Members, Dates & Duration, Budget, Transportation, Expense Sharing, Group Rules, Options Organizer
- User can edit document name at the top of the page
- User can input start and end dates, and duration auto-calculates from date range
- User can select flight as primary transportation method via checkbox
- When flight checkbox is checked, user can select from saved flight booking strategies
- Selected flight strategy is added to transportation planning notes
- User can edit all document fields (budget, transportation, accommodation options, meal options, activity options)
- User can add multiple accommodation, meal, and activity options
- User can save document changes, and changes persist to database
- User can delete documents from profile page
- User can finalize documents, which creates a read-only finalized version

### Abnormal:
**Expected:**
- If user tries to edit document without being logged in, they are redirected to login
- If user tries to edit document they don't own, they see permission error
- If document save fails due to network error, user sees error message and can retry
- If user enters invalid date range (end before start), system shows validation error
- If user deletes a document, confirmation dialog appears before deletion
- If user has unsaved changes and tries to navigate away, browser shows warning
- If document data fails to load, user sees error message with option to reload
- If user's session expires during editing, changes are saved to localStorage and can be recovered

### Extreme:
**Expected:**
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
- User can share document by clicking share button, which generates a 6-character share code
- Share code is displayed in modal with copy button
- User can copy share code to clipboard
- Other users can access shared document by entering share code in "View Document by Code" modal
- Shared document displays in read-only mode for invited users
- Invited users can see all document content but cannot edit any fields
- Invited users see "View Only" indicators throughout the document
- Document creator can see access count and who has viewed the document
- Share code is case-insensitive (e.g., "ABC123" = "abc123")

### Abnormal:
**Expected:**
- If user enters invalid share code (wrong length or format), error message is displayed
- If share code doesn't exist or document is deleted, user sees "Document not found" error
- If user tries to edit shared document, no edit controls are available (read-only enforced)
- If document creator deletes document, shared link becomes invalid
- If user tries to access shared document without internet, appropriate error is shown
- If share code is expired or revoked, user cannot access document
- If multiple users try to access same shared document simultaneously, all can view it
- If user copies share code but document is deleted before they use it, they see error when trying to access

### Extreme:
**Expected:**
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
- User can create a collaboration room from chat modal
- User can set room name and maximum number of users
- Room creation generates a unique 6-character share code
- User can invite others by sharing the room code
- Invite modal displays share code with copy functionality
- User can share room code via email
- Other users can join room by entering share code in "Join Room" modal
- Chat interface displays two tabs: "Chat" and "Users"
- Chat tab shows message history with timestamps
- Users tab shows list of online users in the room
- User can type messages in input field and send them
- Messages appear in real-time for all users in the room
- User can see when other users are typing (typing indicator)
- User can see unread message count in header chat button
- User can leave room, which removes them from user list
- User can delete room, which disconnects all users

### Abnormal:
**Expected:**
- If user tries to join room with invalid code, error message is displayed
- If room is full (reached max users), new users cannot join
- If user loses internet connection, they are marked as offline but remain in user list
- If user's session expires, they are removed from room
- If user tries to send empty message, message is not sent
- If WebSocket connection fails, user sees connection error and can retry
- If user closes browser, they are marked as offline but can rejoin room when they return
- If room creator deletes room, all users are disconnected and see notification

### Extreme:
**Expected:**
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
