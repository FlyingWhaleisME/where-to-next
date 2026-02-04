# User ID Tracking Guide - Console Logging

## How to Track User Identification

I've added comprehensive console logging throughout the authentication system. Here's what to look for:

## Console Log Prefixes

- `🔍 [AUTH CHECK]` - Authentication checks (isAuthenticated calls)
- `🔍 [USER CHECK]` - User retrieval (getCurrentUser calls)
- `🔐 [AUTH]` - Login/Registration process
- `🚪 [LOGOUT]` - Logout button click
- `🚪 [LOGOUT API]` - Logout function execution
- `🔒 [PROTECTED ROUTE]` - Protected route authentication checks
- `🔍 [PROFILE PAGE]` - Profile page authentication checks
- `🔍 [APP]` - App component authentication checks
- `🔍 [USER DATA]` - User data storage operations
- `💾 [USER DATA]` - User data saving operations

## Key Tracking Points

### 1. **Page Load/Reload**
Look for:
- `🔍 [APP] App component mounted/updated`
- `🔍 [APP] Initial authentication check`
- `🔍 [PROTECTED ROUTE] Component rendering`
- `🔍 [PROFILE PAGE] Component mounted/updated`

### 2. **Login**
Look for:
- `🔐 [AUTH] handleAuth called`
- `🔐 [AUTH] Backend response`
- `✅ [AUTH] Login/Register successful`
- `💾 [AUTH] Storing user data in localStorage`
- `💾 [AUTH] Storing token in localStorage`
- `✅ [AUTH] Verification after storage`

### 3. **Logout Button Click**
Look for:
- `🚪 [LOGOUT] Logout button clicked`
- `🚪 [LOGOUT] Current authentication state`
- `🚪 [LOGOUT] User confirmed logout, proceeding...`
- `🚪 [LOGOUT API] logout() function called`
- `🚪 [LOGOUT API] Clearing all user-specific data`
- `🚪 [LOGOUT API] Verification after clearing tokens`

### 4. **Data Loading**
Look for:
- `🔍 [USER DATA] getUserData called for: [key]`
- `🔍 [USER DATA] Auth check for [key]`
- `🔍 [USER DATA] Storage key for [key]: [key]_[userId]`
- `✅ [USER DATA] Successfully loaded [key] for user [userId]`

### 5. **Data Saving**
Look for:
- `💾 [USER DATA] setUserData called for: [key]`
- `💾 [USER DATA] Saving [key] to key: [key]_[userId]`
- `✅ [USER DATA] Successfully saved [key] for user [userId]`

## What to Check

1. **On Page Load:**
   - Is `userId` present in logs?
   - Is `hasToken: true`?
   - Is `hasUserStr: true`?

2. **On Login:**
   - Does `userId` appear in storage logs?
   - Is token stored?
   - Is user data stored?

3. **On Logout:**
   - Is `userId` captured before clearing?
   - Are user-specific keys cleared? (e.g., `tripPreferences_${userId}`)
   - Are tokens cleared?

4. **After Logout:**
   - Are auth checks returning `false`?
   - Are pages redirecting?
   - Is data still accessible?

## User Identification Storage

**Where User ID is Stored:**
- `localStorage.getItem('user')` → `{ id: "...", email: "...", name: "..." }`
- User ID is: `JSON.parse(localStorage.getItem('user')).id`

**How User ID is Used:**
- Data keys: `tripPreferences_${userId}`, `savedTripPreferences_${userId}`, etc.
- Document filtering: `doc.creatorId === userId`

**When User ID is Detected:**
1. On login → Stored in `localStorage.setItem('user', ...)`
2. On page load → Retrieved via `getCurrentUser()`
3. On data operations → Used to create user-specific keys
4. On logout → Used to clear user-specific data

## Users Who Aren't Logged In

**Definition:**
- No token in localStorage (`localStorage.getItem('token') === null`)
- No user in localStorage (`localStorage.getItem('user') === null`)
- `isAuthenticated()` returns `false`
- `getCurrentUser()` returns `null`

**Behavior:**
- Cannot load any user-specific data
- Cannot save any data
- Protected routes redirect to home
- All data operations return `null` or throw errors


