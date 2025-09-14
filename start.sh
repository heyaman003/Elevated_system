#!/bin/bash

echo " Starting Elevator System Simulation..."
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo " Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo " npm is not installed. Please install npm first."
    exit 1
fi

echo " Node.js and npm are installed"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo " Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo " Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo " Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo " All dependencies installed"

# Start the application
echo " Starting the application..."
echo "Backend will be available at: http://localhost:3001"
echo "Frontend will be available at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

npm run dev


