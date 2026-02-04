# Quick Reference: All Code Locations for Screenshots

## **TOOL 1: Database (MongoDB + Mongoose)**

### **Connection Setup**
- **File:** `backend/server.js`
- **Lines:** 34-50
- **What it shows:** Database connection initialization

### **Schema Definition**
- **File:** `backend/models/Document.js`
- **Lines:** 69-110
- **What it shows:** Document structure with nested schemas

### **Creating Documents**
- **File:** `backend/server.js`
- **Lines:** 295-306
- **What it shows:** POST endpoint creating and saving documents

### **Retrieving Documents**
- **File:** `backend/server.js`
- **Lines:** 280-293
- **What it shows:** GET endpoint querying database

### **Updating Documents**
- **File:** `backend/server.js`
- **Lines:** 308-322
- **What it shows:** PUT endpoint updating documents

### **Deleting Documents**
- **File:** `backend/server.js`
- **Lines:** 324-330
- **What it shows:** DELETE endpoint removing documents

### **Saving Chat Messages**
- **File:** `backend/collaborationServer.js`
- **Lines:** 300-310
- **What it shows:** Saving messages to database

### **Loading Chat History**
- **File:** `backend/collaborationServer.js`
- **Lines:** 219-232
- **What it shows:** Querying and retrieving chat messages

---

## **TOOL 2: Third-Party Libraries (Imports)**

### **Frontend Imports**
- **File:** `src/pages/BigIdeaPage.tsx`
- **Lines:** 1-16
- **What it shows:** React, React Router, Framer Motion imports

### **Backend Imports**
- **File:** `backend/server.js`
- **Lines:** 1-9
- **What it shows:** Express, Mongoose, JWT, express-validator imports

### **Using React Hooks**
- **File:** `src/pages/BigIdeaPage.tsx`
- **Lines:** 18-27
- **What it shows:** useState, useEffect, useNavigate hooks

### **Using Express Routes**
- **File:** `backend/server.js`
- **Lines:** 114-150
- **What it shows:** Express route with validation middleware

### **Using Mongoose Models**
- **File:** `backend/models/Document.js`
- **Lines:** 110
- **Then:** `backend/server.js` lines 295-306
- **What it shows:** Model export and usage

---

## **TOOL 3: Event Handlers + Async/Await**

### **WebSocket Connection (Frontend)**
- **File:** `src/services/collaborationService.ts`
- **Lines:** 150-170
- **What it shows:** WebSocket event handlers (onopen, onmessage, onclose, onerror)

### **WebSocket Server Handlers (Backend)**
- **File:** `backend/collaborationServer.js`
- **Lines:** 117-128
- **What it shows:** Server-side event handlers

### **Message Routing**
- **File:** `backend/collaborationServer.js`
- **Lines:** 138-186
- **What it shows:** Switch statement routing messages

### **Async Database Operations**
- **File:** `backend/collaborationServer.js`
- **Lines:** 219-232
- **What it shows:** await ChatMessage.find() for loading history

### **Saving with Async/Await**
- **File:** `backend/collaborationServer.js`
- **Lines:** 300-310
- **What it shows:** await chatMessage.save()

### **Frontend Message Handling**
- **File:** `src/services/collaborationService.ts`
- **Lines:** 288-360
- **What it shows:** Switch statement handling different message types

---

## **TOOL 4: React Framework**

### **React Router Setup**
- **File:** `src/App.tsx`
- **Lines:** 3-17, 31-244
- **What it shows:** BrowserRouter, Routes, Route components

### **React Component with Hooks**
- **File:** `src/pages/BigIdeaPage.tsx`
- **Lines:** 18-56
- **What it shows:** useState, useEffect, component rendering

### **Reusable Component**
- **File:** `src/components/bigIdea/Question1GroupSize.tsx`
- **Lines:** Entire file
- **What it shows:** Component definition with props

### **Conditional Rendering**
- **File:** `src/pages/BigIdeaPage.tsx`
- **Lines:** Throughout return statement
- **What it shows:** Conditional rendering based on state

### **State Management**
- **File:** `src/pages/ProfilePage.tsx`
- **Lines:** Component definition
- **What it shows:** useState, useEffect, state updates

---

## **TOOL 5: JSON Key-Value Structure**

### **User-Specific Storage**
- **File:** `src/utils/userDataStorage.ts`
- **Lines:** 17-63
- **What it shows:** getUserData, setUserData with JSON.parse/stringify

### **Saving Preferences**
- **File:** `src/pages/BigIdeaPage.tsx`
- **Lines:** 88-96
- **What it shows:** Creating nested object, JSON.stringify

### **Loading Documents**
- **File:** `src/pages/DocumentEditingPage.tsx`
- **Lines:** 96-99
- **What it shows:** JSON.parse from localStorage

### **Saving Documents**
- **File:** `src/pages/DocumentEditingPage.tsx`
- **Lines:** 263-375
- **What it shows:** Complex nested object, JSON.stringify

### **MongoDB Schema**
- **File:** `backend/models/Document.js`
- **Lines:** 69-102
- **What it shows:** Nested schema definition

### **Accessing Nested Data**
- **File:** `src/pages/FinalizedDocumentPage.tsx`
- **Lines:** Throughout component
- **What it shows:** Dot notation accessing nested keys

---

## **ADDITIONAL USEFUL LOCATIONS**

### **User Authentication**
- **File:** `backend/server.js`
- **Lines:** 114-150 (register), 152-190 (login)
- **What it shows:** JWT token generation, password hashing

### **Protected Routes**
- **File:** `src/components/ProtectedRoute.tsx`
- **Lines:** Entire file
- **What it shows:** Authentication checking, route protection

### **API Service**
- **File:** `src/services/apiService.ts`
- **Lines:** 48-69
- **What it shows:** HTTP requests using fetch API

### **Chat Message Handling**
- **File:** `src/components/collaboration/DraggableCollaborationPanel.tsx`
- **Lines:** Message handling sections
- **What it shows:** Real-time message updates in UI

---

## **SCREENSHOT CHECKLIST**

For each tool, capture:

1. ✅ **Code screenshot** with line numbers visible
2. ✅ **UI screenshot** showing the feature in action
3. ✅ **Browser DevTools** (Network tab, Application tab, React tab)
4. ✅ **Database interface** (MongoDB Atlas) if applicable

---

## **IMPORTANT NOTES**

- **Remove AI-style comments** before taking screenshots
- **Remove debug console.log** statements if they look unprofessional
- **Keep only professional comments** that explain the code logic
- **Ensure line numbers are visible** in code editor
- **Crop screenshots** to show relevant code sections only

