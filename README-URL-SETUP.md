# 🌍 Where To Next - URL Setup Guide

## 🎯 **Easy URL with Website Name**

Your website can now be accessed with a custom URL that includes "where-to-next":

### **Main Website URL:**
```
http://where-to-next.local:3000
```

## 🚀 **Setup Instructions**

### **Option 1: Automatic Setup (Recommended)**
Run the setup script and enter your password when prompted:
```bash
./setup-local-dns.sh
```

### **Option 2: Manual Setup**
If you prefer to do it manually:

1. **Open Terminal**
2. **Edit hosts file:**
   ```bash
   sudo nano /etc/hosts
   ```
3. **Add this line at the end:**
   ```
   172.22.235.41 where-to-next.local
   ```
4. **Save and exit** (Ctrl+X, then Y, then Enter)

### **Option 3: Use IP Address (No Setup Required)**
If you don't want to modify system files, you can still use:
```
http://172.22.235.41:3000
```

## 🎉 **Start Your Website**

After setup, start the servers:
```bash
./start-network.sh
```

## 📱 **Access from Any Device**

### **On Your Mac:**
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

### **On iPad/Other Devices:**
- **Frontend:** http://where-to-next.local:3000
- **Backend:** http://where-to-next.local:3001
- **WebSocket:** ws://where-to-next.local:8080

## 🔧 **What This Does**

- **Creates a custom hostname** that includes your website name
- **Maps it to your local IP** so other devices can find it
- **Makes the URL memorable** and professional
- **Works on your local network** for testing

## 🎯 **Benefits for Your IA**

- **Professional URL** - Shows understanding of networking
- **Custom hostname** - Demonstrates system administration
- **Local development** - Real-world development practices
- **Network accessibility** - Multi-device testing capability
