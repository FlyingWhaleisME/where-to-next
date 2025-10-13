# 🔍 Real-Time Communication Debugging

## 🎯 **Current Status**
- ✅ **WebSocket Connected** - Green circle shows you're online
- ❌ **Messages Not Syncing** - Can't see messages between users
- ❌ **Users Not Showing** - Users tab shows 0 users
- ❌ **Room Not Syncing** - Users not in same room

## 🔧 **Debugging Steps**

### **Step 1: Check Console Logs**
Open browser developer tools (F12) and look for these logs:

#### **When Creating/Joining Room:**
```
Joining room: room-ABC123 as user: YourName WebSocket state: 1
Sending join room message: {type: "join_room", roomId: "room-ABC123", userId: "user123", userName: "YourName"}
Room joined successfully. Current trip ID: room-ABC123
```

#### **When Sending Messages:**
```
Sending message: Hello! Connected: true
📨 Collaboration message received: chat_message
Received chat message: {id: "...", text: "Hello!", user: {...}, timestamp: "..."}
```

#### **When Users Join:**
```
📨 Collaboration message received: user_joined
User joined: {id: "user456", name: "OtherUser", email: "other@email.com"}
```

### **Step 2: Verify Room IDs Match**
**Critical:** Both users must join the **exact same room ID**.

#### **User 1 (Room Creator):**
1. Click "Start Communication"
2. Click "Create Room & Start Chatting"
3. **Note the share code** (e.g., "ABC123")
4. Room ID becomes: `room-ABC123`

#### **User 2 (Room Joiner):**
1. Click "Join Room"
2. Enter the **exact same share code**: "ABC123"
3. Should join: `room-ABC123`

### **Step 3: Check Backend Logs**
Look at your terminal where the backend is running for:
```
📡 New WebSocket connection attempt
✅ User authenticated: user123
🔗 User joined room: room-ABC123
📨 Broadcasting message to room: room-ABC123
```

## 🚨 **Common Issues & Fixes**

### **Issue 1: Different Room IDs**
**Symptom:** Users can't see each other's messages
**Cause:** Users joined different rooms
**Fix:** Make sure both users use the **exact same share code**

### **Issue 2: WebSocket Not Connected**
**Symptom:** No console logs about joining room
**Cause:** WebSocket connection failed
**Fix:** Check if backend server is running on port 8080

### **Issue 3: JWT Token Issues**
**Symptom:** Authentication errors in backend logs
**Cause:** Expired or invalid JWT token
**Fix:** Logout and login again

### **Issue 4: Backend Not Broadcasting**
**Symptom:** Messages sent but not received
**Cause:** Backend not properly broadcasting to room
**Fix:** Check backend collaboration server logs

## 🧪 **Test Procedure**

### **Test 1: Single User Room Creation**
1. **User 1:** Create room with share code "TEST123"
2. **Check console:** Should see room joining logs
3. **Send message:** Should appear locally
4. **Check Users tab:** Should show 1 user (yourself)

### **Test 2: Two User Room Joining**
1. **User 1:** Create room, get share code "TEST123"
2. **User 2:** Join room with same code "TEST123"
3. **Check console:** Both should see user_joined messages
4. **Check Users tab:** Should show 2 users
5. **Send messages:** Should appear for both users

### **Test 3: Message Broadcasting**
1. **User 1:** Send message "Hello from User 1"
2. **User 2:** Should see message in chat
3. **User 2:** Send reply "Hello from User 2"
4. **User 1:** Should see reply in chat

## 🔍 **Debugging Commands**

### **Check WebSocket Connection:**
```bash
# Check if WebSocket server is running
lsof -i :8080

# Check backend server
lsof -i :3001
```

### **Check Browser Network:**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Look for WebSocket connection to `ws://localhost:8080`
4. Should show "101 Switching Protocols"

## 📋 **Expected Console Output**

### **Successful Room Join:**
```
🔗 Connected to collaboration server
Joining room: room-TEST123 as user: User1 WebSocket state: 1
Sending join room message: {type: "join_room", roomId: "room-TEST123", userId: "user1", userName: "User1"}
Room joined successfully. Current trip ID: room-TEST123
📨 Collaboration message received: user_joined
User joined: {id: "user1", name: "User1", email: "user1@email.com"}
```

### **Successful Message Exchange:**
```
Sending message: Hello! Connected: true
📨 Collaboration message received: chat_message
Received chat message: {id: "123", text: "Hello!", user: {id: "user2", name: "User2"}, timestamp: "2025-01-01T12:00:00Z"}
```

---

**Next Steps:** 
1. **Check console logs** for room joining
2. **Verify both users use same share code**
3. **Test message sending between users**
4. **Check backend logs** for broadcasting
