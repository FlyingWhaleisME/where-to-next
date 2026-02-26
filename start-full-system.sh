#!/bin/bash

echo "Starting Where To Next - Complete System"
echo "========================================"

# Get the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all servers..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "Backend server stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "Frontend server stopped"
    fi
    
    pkill -f "react-scripts" 2>/dev/null
    
    echo "All servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Check if ports are already in use
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $port is already in use by $service"
        echo "Stopping existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

echo "Cleaning up existing processes..."
check_port 3000 "Frontend"
check_port 3001 "Backend"
check_port 8080 "WebSocket"

echo ""
echo "Starting backend server..."
cd "$DIR/backend"
node server.js &
BACKEND_PID=$!

echo "Waiting for backend to initialize..."
sleep 5

if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "Backend server started successfully on port 3001"
else
    echo "Backend server failed to start"
    cleanup
    exit 1
fi

echo ""
echo "Starting frontend server..."
cd "$DIR"
npm run start:network &
FRONTEND_PID=$!

echo "Waiting for frontend to initialize..."
sleep 10

if curl -s http://localhost:3000 > /dev/null; then
    echo "Frontend server started successfully on port 3000"
else
    echo "Frontend server failed to start"
    cleanup
    exit 1
fi

echo ""
echo "SYSTEM READY!"
echo "============="
echo ""
echo "Access your website:"
echo "   Local:     http://localhost:3000"
echo "   Network:   http://where-to-next.local:3000"
echo ""
echo "Backend API:"
echo "   Local:     http://localhost:3001"
echo "   Network:   http://where-to-next.local:3001"
echo ""
echo "WebSocket (collaboration):"
echo "   Local:     ws://localhost:8080"
echo "   Network:   ws://where-to-next.local:8080"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Keep script running and monitor processes
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "Backend server stopped unexpectedly"
        cleanup
        exit 1
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "Frontend server stopped unexpectedly"
        cleanup
        exit 1
    fi
    
    sleep 5
done
