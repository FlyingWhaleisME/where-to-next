# 🔧 Where To Next - Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Issue: "Test Backend Connection" says "Not Connected"**

**Problem:** Backend server is not running
**Solution:** 
```bash
# Option 1: Use the complete startup script (RECOMMENDED)
./start-full-system.sh

# Option 2: Start backend manually
cd backend
node server.js
```

### **Issue: "Something is already running on port 3000"**

**Problem:** Multiple React servers running
**Solution:**
```bash
# Kill all React processes
pkill -f "react-scripts"

# Then start fresh
./start-full-system.sh
```

### **Issue: "Cannot connect to WebSocket"**

**Problem:** Collaboration server not running
**Solution:** The backend server includes the WebSocket server. Make sure backend is running:
```bash
cd backend
node server.js
```

### **Issue: "Network access not working from iPad"**

**Problem:** DNS not set up or wrong URL
**Solution:**
```bash
# Set up local DNS
./setup-local-dns.sh

# Then access from iPad:
# http://where-to-next.local:3000
```

## 🚀 **Quick Start Commands**

### **Start Everything (Recommended):**
```bash
./start-full-system.sh
```

### **Start Individual Servers:**
```bash
# Backend only
cd backend && node server.js

# Frontend only (network mode)
npm run start:network
```

### **Stop Everything:**
```bash
# Kill all processes
pkill -f "react-scripts"
pkill -f "node server.js"
```

## 🔍 **How to Check What's Running**

### **Check Ports:**
```bash
# Check what's using port 3000 (frontend)
lsof -i :3000

# Check what's using port 3001 (backend)
lsof -i :3001

# Check what's using port 8080 (websocket)
lsof -i :8080
```

### **Check Processes:**
```bash
# See all Node.js processes
ps aux | grep node

# See React processes
ps aux | grep react-scripts
```

## 🎯 **Testing Checklist**

### **Before Testing:**
- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000
- [ ] WebSocket server running on port 8080
- [ ] MongoDB running (if using database features)

### **Test Steps:**
1. **Open website:** http://localhost:3000
2. **Click "Test Backend Connection"** - Should show "Connected"
3. **Try login/register** - Should work
4. **Test collaboration features** - Create/join rooms
5. **Test from iPad:** http://where-to-next.local:3000

## 🆘 **Emergency Reset**

If everything is broken:
```bash
# Kill everything
pkill -f "react-scripts"
pkill -f "node server.js"
pkill -f "node"

# Wait a moment
sleep 3

# Start fresh
./start-full-system.sh
```

## 📞 **When to Use Each Script**

- **`./start-full-system.sh`** - Start everything (recommended for daily use)
- **`./start-network.sh`** - Start with network access (old script)
- **`./setup-local-dns.sh`** - Set up custom URL (one-time setup)
- **`npm start`** - Start frontend only (development)
- **`cd backend && node server.js`** - Start backend only (development)
