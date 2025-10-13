# ✅ Where To Next - Final Working Setup

## 🎉 **System is Now Working!**

Both frontend and backend servers are running successfully with the correct configuration.

## 🌐 **Working URLs**

### **For Your Mac (Local Development):**
- **Frontend:** http://localhost:3000 ✅
- **Backend:** http://localhost:3001 ✅
- **WebSocket:** ws://localhost:8080 ✅

### **For iPad/Other Devices on Your Network:**
- **Frontend:** http://172.22.225.253:3000
- **Backend:** http://172.22.225.253:3001
- **WebSocket:** ws://172.22.225.253:8080

## 🚀 **How to Start Your System**

### **Simple Method (Two Terminals):**

**Terminal 1 - Start Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Start Frontend:**
```bash
npm start
```

### **What You'll See:**
- **Backend:** "✅ Connected to MongoDB successfully!"
- **Frontend:** "Compiled successfully!" and "You can now view where-to-next in the browser"

## ✅ **How to Verify Everything is Working**

### **1. Open Your Website:**
http://localhost:3000

### **2. Test Backend Connection:**
- Click the "Test Backend Connection" button on your home page
- Should show "✅ Connected" or success message

### **3. Try Features:**
- ✅ **Login/Register** - Should work
- ✅ **Surveys** - Should save to database
- ✅ **Collaboration** - Should allow creating/joining rooms

## 📱 **Access from iPad**

### **Option 1: Use IP Address (Easier)**
1. Find your Mac's IP address: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. On iPad: Go to `http://[YOUR-IP]:3000`
3. Example: `http://172.22.225.253:3000`

### **Option 2: Use Custom Hostname (Optional)**
If you want to use `where-to-next.local`:
1. Run: `./setup-local-dns.sh`
2. Enter your password when prompted
3. On iPad: Go to `http://where-to-next.local:3000`

## 🔧 **If Something Goes Wrong**

### **Backend Not Working:**
```bash
# Check if it's running
lsof -i :3001

# If not running, start it
cd backend && node server.js
```

### **Frontend Not Working:**
```bash
# Check if it's running
lsof -i :3000

# If not running, start it
npm start
```

### **"Test Backend Connection" Fails:**
```bash
# Make sure backend is running
curl http://localhost:3001/api/test

# If this fails, restart backend
cd backend && node server.js
```

### **Complete Reset (If Everything is Broken):**
```bash
# Kill all processes
pkill -f "react-scripts"
pkill -f "node server.js"

# Wait a moment
sleep 3

# Start backend
cd backend && node server.js &

# Wait for backend to start
sleep 5

# Start frontend
npm start
```

## 🎯 **Key Configuration**

### **URLs in Code:**
- **API Base URL:** `http://localhost:3000` (in `src/services/apiService.ts`)
- **WebSocket URL:** `ws://localhost:8080` (in `src/services/collaborationService.ts`)
- **Backend Port:** 3001 (in `backend/.env`)
- **Frontend Port:** 3000 (React default)

### **Why localhost Works:**
- ✅ **No DNS setup required** - Always works immediately
- ✅ **Most reliable** - No network configuration needed
- ✅ **Perfect for development** - Standard practice
- ✅ **Easy to remember** - localhost:3000, localhost:3001

## 📊 **Database**

- **MongoDB:** Running on port 27017
- **Database Name:** where-to-next
- **Connection String:** `mongodb://127.0.0.1:27017/where-to-next`

## 🎓 **For Your IA**

This setup demonstrates:
- ✅ **Full-stack development** - Frontend + Backend
- ✅ **Database integration** - MongoDB with Mongoose
- ✅ **Real-time features** - WebSocket for collaboration
- ✅ **RESTful API** - Proper backend endpoints
- ✅ **Authentication** - JWT-based user system
- ✅ **Network accessibility** - Works across devices

## 📝 **Daily Workflow**

### **Start of Day:**
```bash
# Terminal 1
cd backend && node server.js

# Terminal 2 (new terminal)
npm start
```

### **End of Day:**
```bash
# Press Ctrl+C in both terminals
```

## 🆘 **Quick Troubleshooting**

| Problem | Solution |
|---------|----------|
| "Test Backend Connection" fails | Make sure backend is running: `cd backend && node server.js` |
| Can't access from iPad | Use IP address instead of localhost |
| Port 3000 already in use | Kill existing process: `pkill -f "react-scripts"` |
| Port 3001 already in use | Kill existing process: `pkill -f "node server.js"` |
| MongoDB connection error | Make sure MongoDB is running: `brew services start mongodb-community` |

## 🎉 **Success Indicators**

You'll know everything is working when:
- ✅ Backend shows "✅ Connected to MongoDB successfully!"
- ✅ Frontend shows "Compiled successfully!"
- ✅ "Test Backend Connection" button works
- ✅ You can login/register
- ✅ Surveys save properly
- ✅ Collaboration features work

---

**Last Updated:** October 1, 2025
**Status:** ✅ All systems operational
**Configuration:** localhost (most reliable setup)
