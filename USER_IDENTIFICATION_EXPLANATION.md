# How User Identification Works (And Why It's Not Working)

## Current User Identification System

### 1. **Login Process:**
When a user logs in:
- Backend returns: `{ id: "user_mongodb_id", email: "user@email.com", name: "User Name" }`
- This gets stored in `localStorage` as:
  - `localStorage.setItem('user', JSON.stringify({ id: "...", email: "...", name: "..." }))`
  - `localStorage.setItem('token', "jwt_token_string")`

### 2. **How We Check If User Is Logged In:**
```typescript
isAuthenticated() {
  return !!localStorage.getItem('token');  // Just checks if token exists
}

getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;  // Returns { id, email, name }
}
```

### 3. **The Problem - Data Storage:**

**Documents (WORKING):**
- Documents have `creatorId` field
- When loading: `docs.filter(doc => doc.creatorId === currentUser.id)`
- ✅ This works because documents are linked to user ID

**Surveys & Preferences (NOT WORKING):**
- Stored as: `localStorage.setItem('tripPreferences', JSON.stringify(data))`
- ❌ NO user ID stored with the data
- ❌ When you load: `localStorage.getItem('tripPreferences')` - it just gets whatever is there
- ❌ If User A logs out and User B logs in, User B sees User A's data!

### 4. **Why Logout Doesn't Work:**

**What happens on logout:**
1. We clear `tripPreferences` from localStorage
2. We clear auth tokens
3. We redirect

**The problem:**
- If you navigate to a page BEFORE the redirect completes, the page might:
  1. Check `isAuthenticated()` - returns false (token cleared)
  2. BUT then still loads data from localStorage if it exists
  3. OR the data was already loaded before logout

**The real issue:**
- Pages load data WITHOUT checking if it belongs to the current user
- Surveys/preferences have NO user ID linkage
- So even after logout, if data exists in localStorage, pages might show it

## The Solution Needed

We need to:
1. Store ALL user data with user ID (like documents do with creatorId)
2. When loading data, ALWAYS verify it belongs to current user
3. If no user is logged in, don't load ANY data
4. Clear data on logout BEFORE redirecting

