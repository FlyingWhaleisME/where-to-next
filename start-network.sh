#!/bin/bash

# Where To Next - Network Access Startup Script
echo "🌍 Starting Where To Next for network access..."
echo ""

# Get the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Start backend
echo "🚀 Starting backend server..."
cd "$DIR/backend"
node server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend server..."
cd "$DIR"
npm run start:network &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started successfully!"
echo ""
echo "📱 Access your website from any device on your network:"
echo "   http://where-to-next.local:3000"
echo ""
echo "🔧 Backend API:"
echo "   http://where-to-next.local:3001"
echo ""
echo "💬 WebSocket (for collaboration):"
echo "   ws://where-to-next.local:8080"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
