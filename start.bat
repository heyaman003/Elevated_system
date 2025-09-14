@echo off
echo  Starting Elevator System Simulation...
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo  Node.js and npm are installed

REM Install dependencies if needed
if not exist "node_modules" (
    echo  Installing root dependencies...
    npm install
)

if not exist "backend\node_modules" (
    echo  Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo  All dependencies installed

REM Start the application
echo  Starting the application...
echo Backend will be available at: http://localhost:3001
echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the application
echo.

npm run dev
