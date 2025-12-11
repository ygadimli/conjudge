#!/bin/bash

# Kill ports if running to avoid conflicts
fuser -k 5000/tcp 2>/dev/null
fuser -k 3000/tcp 2>/dev/null

echo "🚀 Starting ConJudge Platform..."

# Start Backend
echo "📦 Starting Backend Server (Port 5000)..."
cd backend
# Run in background and save logs
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait a bit for backend to initialize
sleep 3

# Start Frontend
echo "💻 Starting Frontend Client (Port 3000)..."
cd ../frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
